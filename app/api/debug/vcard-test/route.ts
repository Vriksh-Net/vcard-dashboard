import { NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * Debug endpoint to test vCard retrieval and database connectivity
 */
export async function GET(request: Request) {
  try {
    // Test database connection
    const testConnection = await db.$queryRaw`SELECT 1 as connected`

    // Get all vCards (limited to 10)
    const allVCards = await db.vCard.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Get all public links
    const allPublicLinks = await db.vCardPublic.findMany({
      take: 10,
      include: {
        vCard: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      status: "success",
      databaseConnected: !!testConnection,
      vCardCount: allVCards.length,
      publicLinkCount: allPublicLinks.length,
      vCards: allVCards,
      publicLinks: allPublicLinks,
      message: "Database check completed successfully",
      env: {
        databaseUrl: process.env.DATABASE_URL ? "Configured (hidden)" : "Not configured",
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
