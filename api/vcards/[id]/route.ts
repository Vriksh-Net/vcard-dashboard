import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Define the generatePublicId function
function generatePublicId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Always await params before using them
    const id = params.id;
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
    if (vcard) {
      console.log("Social links found:", vcard.socialLinks?.length || 0);
      if (vcard.socialLinks && vcard.socialLinks.length > 0) {
        vcard.socialLinks.forEach((link, index) => {
          console.log(
            `Social link ${index + 1}: ${link.platform} - ${link.url}`
          );
        });
      } else {
        console.log("No social links found for this vCard");
      }
    }

    // If not found, try to find by publicId
    if (!vcard) {
      console.log("Trying to find by publicId:", id);

      // First, check if the publicId exists in the database
      const allPublicLinks = await db.vCardPublic.findMany({
        take: 10,
        select: {
          publicId: true,
          vCardId: true,
        },
      });

      console.log("Available public links:", allPublicLinks);

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
        console.log("Social links found:", vcard.socialLinks.length);
        vcard.socialLinks.forEach((link, index) => {
          console.log(
            `Social link ${index + 1}: ${link.platform} - ${link.url}`
          );
        });
      }
    }

    // If still not found, try a more flexible search
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
      const publicId = generatePublicId();
      existingPublicLink = await db.vCardPublic.create({
        data: {
          vCardId: vcard.id,
          publicId,
        },
      });
    }

    console.log("Returning vCard with ID:", vcard.id);
    console.log("Social links:", JSON.stringify(vcard.socialLinks, null, 2));

    // Include the publicId in the response
    const response = {
      ...vcard,
      publicId: existingPublicLink.publicId,
    };

    return NextResponse.json(response);
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

// Keep the rest of the file (PUT and DELETE methods) unchanged
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();

    // Check if vCard exists
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 });
    }

    // Update vCard
    const updatedVCard = await db.vCard.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website || null,
        company: data.company || null,
        position: data.position || null,
        address: data.address || null,
        bio: data.bio || null,
        enableNFC: data.enableNFC || false,
        template: data.template || existingVCard.template,
        primaryColor: data.primaryColor || existingVCard.primaryColor,
        profileImageUrl: data.profileImageUrl || existingVCard.profileImageUrl,
      },
    });

    // Update social links
    if (data.socialLinks) {
      // Delete existing social links
      await db.socialLink.deleteMany({
        where: {
          vCardId: id,
        },
      });

      // Create new social links
      const socialLinksToCreate = [];

      // Handle both object format and array format
      if (Array.isArray(data.socialLinks)) {
        // Array format
        for (const link of data.socialLinks) {
          if (link.platform && link.url) {
            socialLinksToCreate.push({
              vCardId: id,
              platform: link.platform,
              url: link.url,
            });
          }
        }
      } else {
        // Object format
        for (const [platform, url] of Object.entries(data.socialLinks)) {
          if (url && typeof url === "string" && url.trim() !== "") {
            socialLinksToCreate.push({
              vCardId: id,
              platform,
              url,
            });
          }
        }
      }

      // Create all social links
      for (const linkData of socialLinksToCreate) {
        await db.socialLink.create({
          data: linkData,
        });
      }
    }

    // Return the updated vCard with social links
    const vCardWithLinks = await db.vCard.findUnique({
      where: {
        id: id,
      },
      include: {
        socialLinks: true,
      },
    });

    return NextResponse.json(vCardWithLinks);
  } catch (error) {
    console.error("Error updating vCard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Check if vCard exists
    const existingVCard = await db.vCard.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingVCard) {
      return NextResponse.json({ error: "vCard not found" }, { status: 404 });
    }

    // Delete social links
    await db.socialLink.deleteMany({
      where: {
        vCardId: id,
      },
    });

    // Delete public link
    await db.vCardPublic.deleteMany({
      where: {
        vCardId: id,
      },
    });

    // Delete vCard
    await db.vCard.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vCard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
