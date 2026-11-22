import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body.action; // "togglePause" or "toggleFree"
    
    const dataFile = process.env.DATA_FILE || ".data/store.json";
    const filePath = path.join(process.cwd(), dataFile);

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ free: true, isPaused: false, records: [], users: [] }, null, 2));
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    if (action === "togglePause") {
      data.isPaused = !data.isPaused;
    } else if (action === "toggleFree") {
      data.free = !data.free;
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      isPaused: data.isPaused,
      free: data.free,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}