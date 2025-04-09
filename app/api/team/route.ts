
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    console.log("[API] GET /api/team - Fetching all teams")

    // Get the authenticated user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teams where the user is a member
    const teams = await db.team.findMany({
      where: {
        members: {
          some: {
            userId: parseInt(session.user.id, 10),
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
            permissions: true,
          },
        },
      },
    })

    console.log(`[API] GET /api/team - Found ${teams.length} teams`)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("[API] GET /api/team - Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch teams",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("[API] POST /api/team - Creating team:", data.name)

    // Get the authenticated user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create new team with the authenticated user as admin
    const team = await db.team.create({
      data: {
        name: data.name,
        description: data.description || null,
        members: {
          create: {
            userId: parseInt(session.user.id, 10),
            role: "admin",
            permissions: {
              create: {
                createCards: true,
                editCards: true,
                deleteCards: true,
                manageTeam: true,
              },
            },
          },
        },
      },
      include: {
        members: {
          include: {
            permissions: true,
            user: true,
          },
        },
      },
    })

    console.log(`[API] POST /api/team - Created team with ID: ${team.id}`)
    return NextResponse.json(team)
  } catch (error) {
    console.error("[API] POST /api/team - Error:", error)
    return NextResponse.json(
      {
        error: "Failed to create team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

