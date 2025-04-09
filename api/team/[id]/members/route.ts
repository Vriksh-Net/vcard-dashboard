// import { NextResponse } from "next/server"
// import { db } from "@/lib/db"

// export async function GET(request: Request, { params }: { params: { id: string } }) {
//   try {
//     // Get all members of the team without authentication
//     const members = await db.teamMember.findMany({
//       where: {
//         teamId: params.id,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//         permissions: true,
//       },
//     })

//     return NextResponse.json(members)
//   } catch (error) {
//     console.error("Error fetching team members:", error)
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
//   }
// }

// export async function POST(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const data = await request.json()

//     // Validate required fields
//     if (!data.email || !data.role) {
//       return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
//     }

//     // Check if user exists
//     const user = await db.user.findUnique({
//       where: {
//         email: data.email,
//       },
//     })

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     // Check if user is already a member of the team
//     const existingMembership = await db.teamMember.findFirst({
//       where: {
//         teamId: params.id,
//         userId: user.id,
//       },
//     })

//     if (existingMembership) {
//       return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
//     }

//     // Create new team member
//     const member = await db.teamMember.create({
//       data: {
//         teamId: params.id,
//         userId: user.id,
//         role: data.role,
//         permissions: {
//           create: {
//             createCards: data.permissions?.createCards || false,
//             editCards: data.permissions?.editCards || false,
//             deleteCards: data.permissions?.deleteCards || false,
//             manageTeam: data.permissions?.manageTeam || false,
//           },
//         },
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             image: true,
//           },
//         },
//         permissions: true,
//       },
//     })

//     return NextResponse.json(member)
//   } catch (error) {
//     console.error("Error adding team member:", error)
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get all members of the team without authentication
    const members = await db.teamMember.findMany({
      where: {
        teamId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        permissions: true,
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Modify the POST handler to improve error handling and debugging
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const teamId = params.id
    const data = await request.json()
    console.log(`[API] POST /api/team/${teamId}/members - Adding member with email: ${data.email}`, data)

    // Validate required fields
    if (!data.email) {
      console.log(`[API] POST /api/team/${teamId}/members - Missing email field`)
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find the user by email
    let user
    try {
      user = await db.user.findUnique({
        where: {
          email: data.email,
        },
      })

      console.log(`[API] POST /api/team/${teamId}/members - User lookup result:`, user ? "Found" : "Not found")
    } catch (dbError) {
      console.error(`[API] POST /api/team/${teamId}/members - Database error during user lookup:`, dbError)
      return NextResponse.json(
        {
          error: "Database error during user lookup",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // If user doesn't exist, create a new one
    let userId
    if (!user) {
      console.log(`[API] POST /api/team/${teamId}/members - User not found, creating new user`)
      try {
        const newUser = await db.user.create({
          data: {
            email: data.email,
            name: data.name || data.email.split("@")[0], // Use part of email as name if not provided
          },
        })
        userId = newUser.id
        console.log(`[API] POST /api/team/${teamId}/members - Created new user with ID: ${userId}`)
      } catch (createError) {
        console.error(`[API] POST /api/team/${teamId}/members - Error creating user:`, createError)
        return NextResponse.json(
          {
            error: "Failed to create user",
            details: createError instanceof Error ? createError.message : String(createError),
          },
          { status: 500 },
        )
      }
    } else {
      userId = user.id
      console.log(`[API] POST /api/team/${teamId}/members - Found existing user with ID: ${userId}`)
    }

    // Check if the user is already a member of the team
    let existingMember
    try {
      existingMember = await db.teamMember.findFirst({
        where: {
          teamId: teamId,
          userId: userId,
        },
      })

      console.log(
        `[API] POST /api/team/${teamId}/members - Existing membership check:`,
        existingMember ? "Already a member" : "Not a member",
      )
    } catch (memberError) {
      console.error(`[API] POST /api/team/${teamId}/members - Error checking existing membership:`, memberError)
      return NextResponse.json(
        {
          error: "Failed to check existing membership",
          details: memberError instanceof Error ? memberError.message : String(memberError),
        },
        { status: 500 },
      )
    }

    if (existingMember) {
      console.log(`[API] POST /api/team/${teamId}/members - User is already a member of this team`)
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 })
    }

    // Create new team member with permissions
    let teamMember
    try {
      console.log(`[API] POST /api/team/${teamId}/members - Creating team member with role: ${data.role}`)
      console.log(`[API] POST /api/team/${teamId}/members - Permissions:`, data.permissions)

      teamMember = await db.teamMember.create({
        data: {
          teamId: teamId,
          userId: userId,
          role: data.role || "viewer",
          permissions: {
            create: {
              createCards: data.permissions?.createCards || false,
              editCards: data.permissions?.editCards || false,
              deleteCards: data.permissions?.deleteCards || false,
              manageTeam: data.permissions?.manageTeam || false,
            },
          },
        },
        include: {
          user: true,
          permissions: true,
        },
      })

      console.log(`[API] POST /api/team/${teamId}/members - Added member with ID: ${teamMember.id}`)
    } catch (createMemberError) {
      console.error(`[API] POST /api/team/${teamId}/members - Error creating team member:`, createMemberError)
      return NextResponse.json(
        {
          error: "Failed to create team member",
          details: createMemberError instanceof Error ? createMemberError.message : String(createMemberError),
          teamId: teamId,
          userId: userId,
          role: data.role || "viewer",
          permissions: data.permissions,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error(`[API] POST /api/team/${params.id}/members - Unhandled error:`, error)
    return NextResponse.json(
      {
        error: "Failed to add team member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
