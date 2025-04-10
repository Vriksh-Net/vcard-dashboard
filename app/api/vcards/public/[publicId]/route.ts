import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// This is a dedicated endpoint for fetching vCards by publicId
export async function GET(request: Request, { params }: { params: { publicId: string } }) {
  try {
    const { publicId } = params
    console.log("API route: Fetching vCard with publicId:", publicId)

    // Find by publicId
    const publicLink = await db.vCardPublic.findUnique({
      where: {
        publicId: publicId,
      },
      include: {
        vCard: {
          include: {
            socialLinks: true,
          },
        },
      },
    })

    if (!publicLink || !publicLink.vCard) {
      console.log("vCard not found with publicId:", publicId)
      return NextResponse.json(
        {
          error: "vCard not found",
          message: "Could not find a vCard with the provided public ID",
          requestedId: publicId,
        },
        { status: 404 },
      )
    }

    console.log("Found vCard via publicId:", publicLink.vCard.id)

    // Log scan
    try {
      await db.scanLog.create({
        data: {
          vCardId: publicLink.vCard.id,
          scanType: "QR",
          deviceType: "Unknown", // This would be determined client-side
        },
      })
    } catch (error) {
      console.error("Error logging scan:", error)
    }

    // Return the vCard with the publicId
    const response = {
      ...publicLink.vCard,
      publicId: publicLink.publicId,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching vCard by publicId:", error)
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
