import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nanoid } from "nanoid"; //! Import nanoid
import { currentUser } from "@clerk/nextjs/server"; //! Import currentUser from Clerk

// Make sure the GET handler is properly exported and working
export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/vcards - Starting request");

    // Get the authenticated user from Clerk
    const user = await currentUser();

    // If no user is authenticated, return all vCards (for demo purposes)
    // In a production app, you might want to restrict this
    const vcards = await db.vCard.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        socialLinks: true,
      },
    });

    console.log(`[API] GET /api/vcards - Found ${vcards.length} vCards`);

    return NextResponse.json(vcards);
  } catch (error) {
    console.error("[API] GET /api/vcards - Error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required fields" },
        { status: 400 }
      );
    }

    console.log("Creating vCard with data:", JSON.stringify(data, null, 2));

    // Get the authenticated user from Clerk or create/find a dummy user
    let userId;
    const user = await currentUser();

    if (user) {
      // Check if this Clerk user already exists in our database
      const existingUser = await db.user.findUnique({
        where: {
          email: user.emailAddresses[0].emailAddress,
        },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create a new user record for this Clerk user
        const newUser = await db.user.create({
          data: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl,
          },
        });
        userId = newUser.id;
      }
    } else {
      // If no authenticated user, use a dummy user for demo purposes
      const dummyUser =
        (await db.user.findFirst({
          where: {
            email: "dummy@example.com",
          },
        })) ||
        (await db.user.create({
          data: {
            name: "Dummy User",
            email: "dummy@example.com",
          },
        }));

      userId = dummyUser.id;
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
        userId: userId,
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

// Helper function to generate a unique public ID
function generatePublicId() {
  return nanoid(); // Use nanoid for unique ID generation
}
