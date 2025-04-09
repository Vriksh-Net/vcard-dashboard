import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const totalVCards = await db.vCard.count();
    const totalScans = await db.scanLog.count();
    const qrScans = await db.scanLog.count({ where: { scanType: "QR" } });
    const nfcTaps = await db.scanLog.count({ where: { scanType: "NFC" } });

    return NextResponse.json({
      totalVCards,
      totalScans,
      qrScans,
      nfcTaps,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
