import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Log the exact ID we're trying to find
    console.log("Debug route: Searching for vCard with ID:", params.id);

    // Try direct database access with detailed logging
    const directVCard = await db.vCard.findUnique({
      where: {
        id: params.id,
      },
    });

    console.log(
      "Direct vCard query result:",
      directVCard ? "Found" : "Not found"
    );

    // Try finding by publicId
    const publicLink = await db.vCardPublic.findUnique({
      where: {
        publicId: params.id,
      },
    });

    console.log(
      "Public link query result:",
      publicLink ? "Found" : "Not found"
    );

    // Return all database tables and counts to verify database connection
    const vCardCount = await db.vCard.count();
    const publicLinkCount = await db.vCardPublic.count();
    const socialLinkCount = await db.socialLink.count();

    // Return detailed debug information
    return NextResponse.json({
      requestedId: params.id,
      directVCardFound: !!directVCard,
      publicLinkFound: !!publicLink,
      directVCardData: directVCard,
      publicLinkData: publicLink,
      counts: {
        vCards: vCardCount,
        publicLinks: publicLinkCount,
        socialLinks: socialLinkCount,
      },
      message: "This is a debug endpoint to verify database access",
    });
  } catch (error) {
    console.error("Debug route error:", error);
    return NextResponse.json(
      {
        error: "Debug route error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
