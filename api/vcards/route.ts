import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    //! Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required fields" },
        { status: 400 }
      );
    }

    console.log("Creating vCard with data:", JSON.stringify(data, null, 2));

    //! First, create or find a dummy user to associate with the vCard
    let dummyUser;
    try {
      //! Try to find an existing dummy user
      dummyUser = await db.user.findFirst({
        where: {
          email: "dummy@example.com",
        },
      });

      //! If no dummy user exists, create one
      if (!dummyUser) {
        dummyUser = await db.user.create({
          data: {
            name: "Dummy User",
            email: "dummy@example.com",
          },
        });
      }
    } catch (error) {
      console.error("Error creating/finding dummy user:", error);
      return NextResponse.json(
        { error: "Failed to create dummy user" },
        { status: 500 }
      );
    }

    //! Extract social links from the request data
    let socialLinksData = [];

    console.log(
      "Social links from request:",
      JSON.stringify(data.socialLinks, null, 2)
    );

    if (data.socialLinks) {
      if (Array.isArray(data.socialLinks)) {
        //! If socialLinks is already an array, filter out empty links
        socialLinksData = data.socialLinks.filter(
          (link: { platform: any; url: string }) =>
            link.platform &&
            link.url &&
            typeof link.url === "string" &&
            link.url.trim() !== ""
        );
      } else if (
        typeof data.socialLinks === "object" &&
        data.socialLinks !== null
      ) {
        //! If socialLinks is an object, convert to array format
        for (const [platform, url] of Object.entries(data.socialLinks)) {
          if (url && typeof url === "string" && url.trim() !== "") {
            socialLinksData.push({
              platform,
              url: url.trim(),
            });
          }
        }
      }
    }

    console.log(
      "Processed social links data:",
      JSON.stringify(socialLinksData, null, 2)
    );

    //! Create vCard first
    const vcard = await db.vCard.create({
      data: {
        userId: dummyUser.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website || null,
        company: data.company || null,
        position: data.position || null,
        address: data.address || null,
        bio: data.bio || null,
        enableNFC: data.enableNFC || false,
        template: data.template || "template1",
        primaryColor: data.primaryColor || "#4285F4",
        profileImageUrl: data.profileImageUrl || null,
      },
    });

    console.log("Created vCard with ID:", vcard.id);

    //! Create social links one by one with explicit error handling
    const createdSocialLinks = [];
    for (const link of socialLinksData) {
      try {
        console.log(
          `Creating social link for vCard ${vcard.id}: ${link.platform} - ${link.url}`
        );
        const socialLink = await db.socialLink.create({
          data: {
            vCardId: vcard.id,
            platform: link.platform,
            url: link.url,
          },
        });
        createdSocialLinks.push(socialLink);
        console.log(
          `Successfully created social link with ID: ${socialLink.id}`
        );
      } catch (error) {
        console.error(
          `Error creating social link for platform ${link.platform}:`,
          error
        );
      }
    }

    //! Generate a public ID
    const publicId = generatePublicId();
    const publicLink = await db.vCardPublic.create({
      data: {
        vCardId: vcard.id,
        publicId,
      },
    });

    //! Fetch the complete vCard with social links
    const completeVCard = await db.vCard.findUnique({
      where: {
        id: vcard.id,
      },
      include: {
        socialLinks: true,
      },
    });

    console.log(
      "Retrieved complete vCard with social links:",
      JSON.stringify(
        {
          id: completeVCard?.id,
          name: completeVCard?.name,
          socialLinks: completeVCard?.socialLinks,
        },
        null,
        2
      )
    );

    //! Prepare the response
    const responseData = {
      ...completeVCard,
      publicId: publicLink.publicId,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating vCard:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          details: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("GET /api/vcards - Fetching all vCards");

    // Get all vCards with social links
    const vcards = await db.vCard.findMany({
      include: {
        socialLinks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${vcards.length} vCards`);

    return NextResponse.json(vcards);
  } catch (error) {
    console.error("Error fetching vCards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Define the generatePublicId function
function generatePublicId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
