import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataFile = process.env.DATA_FILE || ".data/store.json";
    const filePath = path.join(process.cwd(), dataFile);

    let free = true;
    let paused = false;
    let bps = 50;
    let minFeeLamports = 5_000_000;

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      free = data.free !== undefined ? data.free : true;
      paused = data.isPaused || false;
      bps = data.bps || 50;
      minFeeLamports = data.minFeeLamports || 5_000_000;
    } else {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ free: true, isPaused: false, bps: 50, minFeeLamports: 5_000_000, records: [], users: [] }, null, 2));
    }

    return NextResponse.json({
      free,
      paused,
      mode: "bps",
      bps,
      minFeeLamports,
      treasury: process.env.TREASURY_WALLET || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}