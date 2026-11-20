# Kinetix Batch Pay ($KNTX)

Non-custodial bulk SOL / SPL payments on Solana. Next.js 14 + TypeScript + Tailwind + web3.js + spl-token.

## Setup
```bash
npm install
cp .env.example .env.local   # fill OWNER_WALLET, TREASURY_WALLET, SESSION_SECRET, RPC URLs
npm run dev                  # http://localhost:3000  (admin: /admin)
```
Test on devnet first (`NEXT_PUBLIC_CLUSTER=devnet` + a devnet RPC).

## Deploy
Vercel: import the repo, add the env vars, deploy. Netlify: use the Next.js runtime plugin.
Replace the JSON file store in `lib/store.ts` with Redis/Postgres (Upstash, Vercel KV, Supabase): serverless disks are ephemeral.

## How it works
- Parse CSV/JSON/manual rows, validate base58 addresses, reject duplicates, convert amounts with BigInt (no floats).
- Pack recipients into as few v0 transactions as fit in 1232 bytes; simulate each, set the compute limit from the simulation (+15%), add a p75 priority fee.
- The wallet signs everything client-side (`signAllTransactions`). The server never sees keys.
- Rebroadcast until confirmed or the blockhash expires; Pending / Confirmed / Finalized / Failed with Solscan links. Failed sub-batches can be retried; a status check prevents paying twice.
- Admin: sign a nonce message with `OWNER_WALLET` -> 30-minute httpOnly cookie. Fee, treasury, free mode and pause live in the store. Analytics are derived from on-chain data.

## Known limits (read before mainnet)
- No custom on-chain program yet: fee collection is enforced by the UI, so a modified client could skip the fee. Enforcing fees on-chain needs an Anchor program.
- Pause is enforced by the UI and config API only, for the same reason.
- Ledger can't `signMessage`, so use a software wallet for admin sign-in (or add a memo-transaction login).
- Unaudited and not compiled in the authoring sandbox (no network): run `npm run build`, then test on devnet.
