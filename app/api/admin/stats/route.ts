import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dataFile = process.env.DATA_FILE || ".data/store.json";
    const filePath = path.join(process.cwd(), dataFile);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: true,
        stats: {
          totalTransactions: 0,
          totalVolume: 0,
          totalFees: 0,
          uniqueUsers: 0,
          isPaused: false,
          isFree: true,
          bps: 50,
          minFeeLamports: 5_000_000,
        },
      });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    const records = data.records || data.transactions || [];
    const users = data.users || [];

    const totalTransactions = records.length;
    const totalVolume = records.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    const totalFees = records.reduce((sum: number, r: any) => sum + (r.fee || 0), 0);
    const uniqueUsers = users.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalTransactions,
        totalVolume,
        totalFees,
        uniqueUsers,
        isPaused: data.isPaused || false,
        isFree: data.free !== undefined ? data.free : true,
        bps: data.bps || 50,
        minFeeLamports: data.minFeeLamports || 5_000_000,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}