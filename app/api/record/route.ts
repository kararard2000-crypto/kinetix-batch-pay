import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { isAdmin } from "@/lib/auth";
import { load, save } from "@/lib/store";
import { MEMO } from "@/lib/batch";
import rateLimit from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// إعداد حدود الطلبات: السماح بحد أقصى 10 طلبات في الدقيقة لكل مستخدم/IP
const limiter = rateLimit({
  interval: 60 * 1000, // دقيقة واحدة
  uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest) {
  if (!isAdmin(req.cookies.get("kntx_admin")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { stats } = load();
  return NextResponse.json({ ...stats, users: stats.users.length });
}

/** Analytics are derived from on-chain data, never from client-reported numbers. */
export async function POST(req: NextRequest) {
  try {
    // تطبيق الحماية من الطلبات المتكررة (Rate Limiting)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    try {
      // @ts-ignore
      await limiter.check(NextResponse, 10, ip); // حد أقصى 10 طلبات كل دقيقة
    } catch {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { wallet, signatures } = body || {};

    if (typeof wallet !== "string" || !Array.isArray(signatures) || signatures.length > 100) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Validate wallet public key format
    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    // Fallback RPC mechanism
    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const c = new Connection(rpcUrl, "confirmed");
    
    const d = load(); 
    let counted = false;

    for (const sig of signatures as string[]) {
      if (typeof sig !== "string" || d.seen.includes(sig)) continue;
      
      try {
        const t = await c.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
        if (!t || t.meta?.err || t.transaction.message.accountKeys[0].pubkey.toBase58() !== wallet) continue;
        
        const ixs: any[] = t.transaction.message.instructions;
        if (!ixs.some((i) => i.program === "spl-memo" && i.parsed === MEMO)) continue;

        for (const i of ixs) {
          const p = i.parsed;
          if (i.program === "system" && p?.type === "transfer") {
            if (p.info.destination === d.cfg.treasury) {
              d.stats.revenueLamports += p.info.lamports; // SOL fees only
            } else {
              d.stats.volume.SOL = (d.stats.volume.SOL ?? 0) + p.info.lamports / 1e9;
            }
          } else if (String(i.program).startsWith("spl-token") && p?.type === "transferChecked") {
            d.stats.volume[p.info.mint] = (d.stats.volume[p.info.mint] ?? 0) + Number(p.info.tokenAmount.uiAmountString);
          }
        }
        
        d.seen = [...d.seen, sig].slice(-5000); 
        counted = true;
      } catch (txErr) {
        // Skip individual failing transaction lookups safely
        continue;
      }
    }

    if (counted) { 
      d.stats.batches++; 
      if (!d.stats.users.includes(wallet)) {
        d.stats.users.push(wallet);
      } 
      save(d); 
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}