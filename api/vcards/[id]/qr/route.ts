import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if vCard exists
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 });
    }

    // Get public link
    const publicLink = await db.vCardPublic.findFirst({
      where: {
        vCardId: params.id,
      },
    });

    if (!publicLink) {
      return NextResponse.json(
        { error: "Public link not found" },
        { status: 404 }
      );
    }

    // Get scan count
    const scanCount = await db.scanLog.count({
      where: {
        vCardId: params.id,
        scanType: "QR",
      },
    });

    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vcard/${publicLink.publicId}`;

    return NextResponse.json({
      qrCodeUrl,
      scanCount,
      lastScan: await db.scanLog.findFirst({
        where: {
          vCardId: params.id,
          scanType: "QR",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      }),
    });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
