import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // مسار ملف البيانات (من .env.local)
    const dataFile = process.env.DATA_FILE || ".data/store.json";
    const filePath = path.join(process.cwd(), dataFile);

    // إذا لم يكن الملف موجوداً، نرجع أصفاراً
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: true,
        stats: {
          totalTransactions: 0,
          totalVolume: 0,
          totalFees: 0,
          uniqueUsers: 0,
          isPaused: false,
        },
      });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);

    // حساب الإحصائيات (بناءً على هيكل store.json)
    // ملاحظة: هذا الهيكل قد يحتاج لتعديل حسب ما يخزنه API record
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
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}