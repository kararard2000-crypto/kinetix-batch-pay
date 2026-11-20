import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { isAdmin } from "@/lib/auth";
import { load, save } from "@/lib/store";
import { MAX_FEE_BPS } from "@/lib/batch";

export const dynamic = "force-dynamic";

export const GET = () => NextResponse.json(load().cfg);

export async function PUT(req: NextRequest) {
  // Check admin authorization
  if (!isAdmin(req.cookies.get("kntx_admin")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const b = await req.json();

    // Validate treasury public key
    try { 
      new PublicKey(b.treasury); 
    } catch { 
      return NextResponse.json({ error: "Invalid treasury address" }, { status: 400 }); 
    }

    const okInt = (n: any, max: number) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;

    if (!["flat", "percent"].includes(b.mode) || !okInt(b.bps, MAX_FEE_BPS) || !okInt(b.flatLamports, 1e9)) {
      return NextResponse.json({ error: `Fee out of range (max ${MAX_FEE_BPS} bps / 1 SOL)` }, { status: 400 });
    }

    const d = load();
    d.cfg = { 
      mode: b.mode, 
      flatLamports: b.flatLamports, 
      bps: b.bps, 
      free: !!b.free, 
      treasury: b.treasury, 
      paused: !!b.paused 
    };
    
    save(d);
    return NextResponse.json(d.cfg);
  } catch (err) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}