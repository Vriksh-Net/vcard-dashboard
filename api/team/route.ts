// import { NextResponse } from "next/server"
// import { db } from "@/lib/db"

// export async function GET(request: Request) {
//   try {
//     // Get all teams without authentication
//     const teams = await db.team.findMany({
//       include: {
//         members: {
//           include: {
//             permissions: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(teams)
//   } catch (error) {
//     console.error("Error fetching teams:", error)
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const data = await request.json()

//     // Validate required fields
//     if (!data.name) {
//       return NextResponse.json({ error: "Team name is required" }, { status: 400 })
//     }

//     // First, create or find a dummy user to associate with the team
//     let dummyUser
//     try {
//       // Try to find an existing dummy user
//       dummyUser = await db.user.findFirst({
//         where: {
//           email: "dummy@example.com",
//         },
//       })

//       // If no dummy user exists, create one
//       if (!dummyUser) {
//         dummyUser = await db.user.create({
//           data: {
//             name: "Dummy User",
//             email: "dummy@example.com",
//           },
//         })
//       }
//     } catch (error) {
//       console.error("Error creating/finding dummy user:", error)
//       return NextResponse.json({ error: "Failed to create dummy user" }, { status: 500 })
//     }

//     // Create new team with the dummy user
//     const team = await db.team.create({
//       data: {
//         name: data.name,
//         description: data.description || null,
//         members: {
//           create: {
//             userId: dummyUser.id, // Use the dummy user's ID
//             role: "admin",
//             permissions: {
//               create: {
//                 createCards: true,
//                 editCards: true,
//                 deleteCards: true,
//                 manageTeam: true,
//               },
//             },
//           },
//         },
//       },
//       include: {
//         members: {
//           include: {
//             permissions: true,
//           },
//         },
//       },
//     })

//     return NextResponse.json(team)
//   } catch (error) {
//     console.error("Error creating team:", error)
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get all teams without authentication
    const teams = await db.team.findMany({
      include: {
        members: {
          include: {
            permissions: true,
          },
        },
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Modify the POST handler to improve error handling and debugging
export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("[API] POST /api/team - Creating team:", data)

    // Validate required fields
    if (!data.name) {
      console.log("[API] POST /api/team - Missing team name")
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create new team with a dummy user as admin
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
        console.log("[API] POST /api/team - Creating dummy user")
        dummyUser = await db.user.create({
          data: {
            name: "Dummy User",
            email: "dummy@example.com",
          },
        })
        console.log("[API] POST /api/team - Created dummy user with ID:", dummyUser.id)
      } else {
        console.log("[API] POST /api/team - Using existing dummy user with ID:", dummyUser.id)
      }
    } catch (userError) {
      console.error("[API] POST /api/team - Error with dummy user:", userError)
      return NextResponse.json(
        {
          error: "Failed to create/find dummy user",
          details: userError instanceof Error ? userError.message : String(userError),
        },
        { status: 500 },
      )
    }

    // Create the team
    let team
    try {
      console.log("[API] POST /api/team - Creating team with name:", data.name)
      team = await db.team.create({
        data: {
          name: data.name,
          description: data.description || null,
          members: {
            create: {
              userId: dummyUser.id,
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
    } catch (teamError) {
      console.error("[API] POST /api/team - Error creating team:", teamError)
      return NextResponse.json(
        {
          error: "Failed to create team",
          details: teamError instanceof Error ? teamError.message : String(teamError),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("[API] POST /api/team - Unhandled error:", error)
    return NextResponse.json(
      {
        error: "Failed to create team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
