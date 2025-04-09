import { NextResponse } from "next/server"
import crypto from "crypto"
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and content type are required" }, { status: 400 })
    }

    // First, create or find a dummy user to associate with the upload
    let dummyUser
    try {
      // Try to find an existing dummy user
      dummyUser = await db.user.findFirst({
        where: {
          email: "dummy@example.com",
        },
      })

      // If no dummy user exists, create one
      if (!dummyUser) {
        dummyUser = await db.user.create({
          data: {
            name: "Dummy User",
            email: "dummy@example.com",
          },
        })
      }
    } catch (error) {
      console.error("Error creating/finding dummy user:", error)
      // Continue anyway, we'll use a generic folder name
    }

    // Generate a unique key for the file
    const fileExtension = filename.split(".").pop()
    const randomId = crypto.randomBytes(16).toString("hex")
    const key = `uploads/${dummyUser?.id || "anonymous"}/${randomId}.${fileExtension}`

    //! Save file metadata to the database
    const fileRecord = await db.file.create({
      data: {
        filename,
        contentType,
        key,
        userId: dummyUser?.id || null, // Associate with the dummy user if available
      },
    })

    // Return the file metadata
    return NextResponse.json({
      message: "File metadata saved successfully",
      file: fileRecord,
    })
  } catch (error) {
    console.error("Error saving file metadata:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

