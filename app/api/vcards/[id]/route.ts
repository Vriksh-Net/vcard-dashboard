import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await params).id;
    console.log("API route: Fetching vCard with ID:", id);

    // First, try to find by exact ID
    let vcard = await db.vCard.findUnique({
      where: {
        id: id,
      },
      include: {
        socialLinks: true,
      },
    });

    console.log("vCard found by exact ID:", vcard ? "Yes" : "No");

    // If not found, try to find by publicId
    if (!vcard) {
      console.log("Trying to find by publicId:", id);

      const publicLink = await db.vCardPublic.findUnique({
        where: {
          publicId: id,
        },
        include: {
          vCard: {
            include: {
              socialLinks: true,
            },
          },
        },
      });

      console.log("vCard found by publicId:", publicLink ? "Yes" : "No");

      if (publicLink && publicLink.vCard) {
        vcard = publicLink.vCard;
        console.log("Retrieved vCard from public link:", vcard.id);
      }
    }

    if (!vcard) {
      console.log("vCard not found with any method for ID:", id);

      // List a few vCards from the database to help debugging
      const sampleVCards = await db.vCard.findMany({
        take: 5,
        select: { id: true, name: true },
      });

      console.log("Sample vCards in database:", sampleVCards);

      return NextResponse.json(
        {
          error: "vCard not found",
          message: "Could not find a vCard with the provided ID",
          requestedId: id,
          sampleIds: sampleVCards.map((v) => v.id),
        },
        { status: 404 }
      );
    }

    // Check if public link exists
    let existingPublicLink = await db.vCardPublic.findFirst({
      where: {
        vCardId: vcard.id,
      },
    });

    // Only create a new public link if one doesn't exist
    if (!existingPublicLink) {
      const publicId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      existingPublicLink = await db.vCardPublic.create({
        data: {
          vCardId: vcard.id,
          publicId,
        },
      });
    }

    console.log("Returning vCard with ID:", vcard.id);

    // Include the publicId in the response
    return NextResponse.json({
      ...vcard,
      publicId: existingPublicLink.publicId,
    });
  } catch (error) {
    console.error("Error fetching vCard:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
