import {
  ComputeBudgetProgram, Connection, PublicKey, SystemProgram,
  TransactionInstruction, TransactionMessage, VersionedTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction, getAssociatedTokenAddressSync, getMint,
} from "@solana/spl-token";

export const MAX_TX_BYTES = 1232;
/** Hard cap applied client- AND server-side so a tampered config can never over-charge. */
export const MAX_FEE_BPS = 500;
export const MEMO = "kinetix:batch"; // lets the server recognise batches built by this app
const MEMO_PROGRAM = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const DUMMY_BLOCKHASH = PublicKey.default.toBase58();
const U64_MAX = (1n << 64n) - 1n;

export type Fee = { mode: "flat" | "percent"; flatLamports: number; bps: number; free: boolean; treasury: string; paused: boolean };
export type Asset = { mint: PublicKey | null; decimals: number; program: PublicKey };
export type Payment = { to: PublicKey; raw: bigint };
export type Status = "Pending" | "Confirmed" | "Finalized" | "Failed";
const SOL: Asset = { mint: null, decimals: 9, program: SystemProgram.programId };

/** Exact decimal -> base units. No floats: rejects extra precision, zero, and u64 overflow. */
export function toRaw(amount: string, decimals: number): bigint {
  const m = /^(\d+)(?:\.(\d+))?$/.exec((amount ?? "").trim());
  if (!m) throw new Error("Invalid amount");
  const frac = m[2] ?? "";
  if (frac.length > decimals) throw new Error(`Max ${decimals} decimals`);
  const raw = BigInt(m[1] + frac.padEnd(decimals, "0"));
  if (raw <= 0n || raw > U64_MAX) throw new Error("Amount out of range");
  return raw;
}

/** Accepts JSON ([{address, amount}]) or CSV / one "address,amount" per line. */
export function parseInput(text: string): { address: string; amount: string }[] {
  try {
    const t = text.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      return (JSON.parse(t) as any[]).map((r) => ({ 
        address: String(r.address ?? "").trim(), 
        amount: String(r.amount ?? "").trim() 
      }));
    }
    return t.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !/^address/i.test(l))
      .map((l) => { 
        const [address = "", amount = ""] = l.split(/[,;\t ]+/); 
        return { address, amount }; 
      });
  } catch {
    throw new Error("Failed to parse input data");
  }
}

export function validate(rows: { address: string; amount: string }[], decimals: number) {
  const seen = new Set<string>(); 
  const ok: Payment[] = []; 
  const errors: string[] = [];
  
  rows.forEach((r, i) => {
    try {
      const to = new PublicKey(r.address);
      if (to.toBase58() !== r.address) throw new Error("Non-canonical address");
      if (seen.has(r.address)) throw new Error("Duplicate address");
      seen.add(r.address);
      ok.push({ to, raw: toRaw(r.amount, decimals) });
    } catch (e: any) { 
      errors.push(`Row ${i + 1}: ${e.message}`); 
    }
  });
  return { ok, errors };
}

export async function resolveAsset(c: Connection, mint?: string): Promise<Asset> {
  if (!mint) return SOL;
  try {
    const key = new PublicKey(mint);
    const info = await c.getAccountInfo(key);
    if (!info) throw new Error("Mint not found on this cluster");
    const program = info.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
    if (!info.owner.equals(program)) throw new Error("Address is not an SPL token mint");
    const mintData = await getMint(c, key, "confirmed", program);
    return { mint: key, decimals: mintData.decimals, program };
  } catch (err: any) {
    throw new Error(err.message || "Failed to resolve asset");
  }
}

function payIxs(a: Asset, from: PublicKey, p: Payment): TransactionInstruction[] {
  if (!a.mint) return [SystemProgram.transfer({ fromPubkey: from, toPubkey: p.to, lamports: p.raw })];
  const src = getAssociatedTokenAddressSync(a.mint, from, true, a.program);
  const dst = getAssociatedTokenAddressSync(a.mint, p.to, true, a.program);
  return [
    createAssociatedTokenAccountIdempotentInstruction(from, dst, p.to, a.mint, a.program),
    createTransferCheckedInstruction(src, a.mint, dst, from, p.raw, a.decimals, [], a.program),
  ];
}

const head = (cu: number, micro: number) => [
  ComputeBudgetProgram.setComputeUnitLimit({ units: cu }),
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: micro }),
];

const compile = (payer: PublicKey, blockhash: string, ixs: TransactionInstruction[]) =>
  new VersionedTransaction(new TransactionMessage({ payerKey: payer, recentBlockhash: blockhash, instructions: ixs }).compileToV0Message());

/** Dynamic batching: greedily packs recipients until the serialized tx would exceed the packet limit. */
export async function buildBatch(c: Connection, payer: PublicKey, a: Asset, pays: Payment[], cfg: Fee) {
  let treasury: PublicKey;
  try {
    treasury = new PublicKey(cfg.treasury);
  } catch {
    throw new Error("Invalid treasury wallet address in configuration");
  }

  const total = pays.reduce((s, p) => s + p.raw, 0n);
  const bps = Math.min(cfg.bps, MAX_FEE_BPS);
  const fee = cfg.free ? 0n : cfg.mode === "flat" ? BigInt(cfg.flatLamports) : (total * BigInt(bps)) / 10_000n;
  const feeAsset = cfg.mode === "flat" ? SOL : a; // flat = SOL per batch, percent = same asset as the batch
  const groups = [...(fee > 0n ? [payIxs(feeAsset, payer, { to: treasury, raw: fee })] : []), ...pays.map((p) => payIxs(a, payer, p))];
  const memo = new TransactionInstruction({ programId: MEMO_PROGRAM, keys: [], data: Buffer.from(MEMO) });

  const chunks: TransactionInstruction[][] = []; 
  let cur: TransactionInstruction[] = [];
  
  for (const g of groups) {
    const next = [...cur, ...g];
    const size = compile(payer, DUMMY_BLOCKHASH, [...head(1_400_000, 1), memo, ...next]).serialize().length;
    if (cur.length && size > MAX_TX_BYTES) { 
      chunks.push(cur); 
      cur = g; 
    } else {
      cur = next;
    }
  }
  if (cur.length) chunks.push(cur);

  let rent = 0; // approx. rent for recipient token accounts that don't exist yet
  if (a.mint) {
    const dsts = pays.map((p) => getAssociatedTokenAddressSync(a.mint!, p.to, true, a.program));
    let missing = 0;
    try {
      for (let i = 0; i < dsts.length; i += 100) {
        const infos = await c.getMultipleAccountsInfo(dsts.slice(i, i + 100));
        missing += infos.filter((x) => !x).length;
      }
      rent = missing * (await c.getMinimumBalanceForRentExemption(165));
    } catch {
      // Ignore network errors during rent estimation and keep default 0
    }
  }
  return { chunks: chunks.map((x) => [...x, memo]), fee, feeAsset, total, rent };
}

export async function priorityFee(c: Connection, capMicro = 1_000_000) {
  try {
    const fees = await c.getRecentPrioritizationFees();
    const f = fees.map((x) => x.prioritizationFee).filter((x) => x > 0).sort((x, y) => x - y);
    return Math.min(capMicro, f.length ? f[Math.floor(f.length * 0.75)] : 1_000); // p75 of recent fees
  } catch {
    return 1_000;
  }
}

/** Fresh blockhash + simulation-derived compute limit (+15%). Throws before the wallet is ever prompted. */
export async function finalize(c: Connection, payer: PublicKey, ixs: TransactionInstruction[], micro: number) {
  const { blockhash, lastValidBlockHeight } = await c.getLatestBlockhash("confirmed");
  const sim = await c.simulateTransaction(compile(payer, blockhash, [...head(1_400_000, micro), ...ixs]),
    { sigVerify: false, replaceRecentBlockhash: true, commitment: "confirmed" });
  if (sim.value.err) throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}`);
  const cu = Math.min(1_400_000, Math.ceil((sim.value.unitsConsumed ?? 200_000) * 1.15) + 500);
  return { tx: compile(payer, blockhash, [...head(cu, micro), ...ixs]), cu, lastValid: lastValidBlockHeight };
}

/** Rebroadcasts the same signed tx every 2s until it lands or its blockhash expires. */
export async function send(c: Connection, tx: VersionedTransaction, lastValid: number, on: (s: Status, sig: string, err?: string) => void) {
  const raw = tx.serialize();
  const opts = { skipPreflight: true, maxRetries: 0 };
  const sig = await c.sendRawTransaction(raw, opts);
  on("Pending", sig);
  for (;;) {
    try {
      const [st, height] = await Promise.all([c.getSignatureStatuses([sig]), c.getBlockHeight("confirmed")]);
      const s = st.value[0]; 
      const cs = s?.confirmationStatus;
      if (s?.err) return on("Failed", sig, JSON.stringify(s.err));
      if (cs === "finalized") return on("Finalized", sig);
      if (cs === "confirmed") on("Confirmed", sig);
      else if (!cs) {
        if (height > lastValid) return on("Failed", sig, "Blockhash expired. Retry to re-sign.");
        await c.sendRawTransaction(raw, opts).catch(() => {});
      }
    } catch {
      // Transient network check errors are ignored in loop retry
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}