import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30days";

    const startDate = new Date();

    switch (timeRange) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get total vCards
    const totalVCards = await db.vCard.count();

    // Get new vCards in time range
    const newVCards = await db.vCard.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get total scans
    const totalScans = await db.scanLog.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get QR code scans
    const qrScans = await db.scanLog.count({
      where: {
        scanType: "QR",
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get NFC scans
    const nfcScans = await db.scanLog.count({
      where: {
        scanType: "NFC",
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get scan activity over time
    const scanActivity = await db.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        COUNT(*) as count
      FROM "ScanLog"
      WHERE 
        "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;

    // Get top vCards
    const topVCards = await db.vCard.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            scanLogs: {
              where: {
                createdAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        scanLogs: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // Get scan methods distribution
    const scanMethods = [
      {
        method: "QR",
        count: qrScans,
        percentage:
          totalScans > 0 ? Math.round((qrScans / totalScans) * 100) : 0,
      },
      {
        method: "NFC",
        count: nfcScans,
        percentage:
          totalScans > 0 ? Math.round((nfcScans / totalScans) * 100) : 0,
      },
    ];

    return NextResponse.json({
      totalVCards,
      newVCards,
      totalScans,
      qrScans,
      nfcScans,
      scanActivity,
      topVCards: topVCards.map((vcard) => ({
        id: vcard.id,
        name: vcard.name,
        scans: vcard._count.scanLogs,
      })),
      scanMethods,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
