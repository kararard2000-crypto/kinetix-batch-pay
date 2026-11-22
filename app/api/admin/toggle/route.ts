import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, value } = body; // action: "togglePause" | "toggleFree" | "setBps" | "setMinFee"
    
    const dataFile = process.env.DATA_FILE || ".data/store.json";
    const filePath = path.join(process.cwd(), dataFile);

    // إذا لم يكن الملف موجوداً، ننشئه
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ 
        free: true, 
        isPaused: false, 
        bps: 50, 
        minFeeLamports: 5_000_000,
        records: [], 
        users: [] 
      }, null, 2));
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    let responseData: any = { success: true };

    if (action === "togglePause") {
      data.isPaused = !data.isPaused;
      responseData.isPaused = data.isPaused;
    } else if (action === "toggleFree") {
      data.free = !data.free;
      responseData.free = data.free;
    } else if (action === "setBps" && typeof value === "number") {
      data.bps = Math.max(0, Math.min(500, value)); // بين 0% و 5%
      responseData.bps = data.bps;
    } else if (action === "setMinFee" && typeof value === "number") {
      data.minFeeLamports = Math.max(0, value);
      responseData.minFeeLamports = data.minFeeLamports;
    } else {
      return NextResponse.json({ success: false, error: "Invalid action or value" }, { status: 400 });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}