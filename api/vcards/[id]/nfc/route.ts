import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Check if vCard exists
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 });
    }

    // Create or update NFC link
    const nfcLink = await db.nFCLink.upsert({
      where: {
        vCardId: params.id,
      },
      update: {
        nfcCardId: data.nfcCardId,
        lastProgrammed: new Date(),
      },
      create: {
        vCardId: params.id,
        nfcCardId: data.nfcCardId,
        lastProgrammed: new Date(),
      },
    });

    return NextResponse.json(nfcLink);
  } catch (error) {
    console.error("Error linking NFC card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    // Get NFC link
    const nfcLink = await db.nFCLink.findUnique({
      where: {
        vCardId: params.id,
      },
    });

    if (!nfcLink) {
      return NextResponse.json(
        { error: "NFC link not found" },
        { status: 404 }
      );
    }

    // Get scan count
    const scanCount = await db.scanLog.count({
      where: {
        vCardId: params.id,
        scanType: "NFC",
      },
    });

    return NextResponse.json({
      ...nfcLink,
      scanCount,
    });
  } catch (error) {
    console.error("Error fetching NFC link:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
