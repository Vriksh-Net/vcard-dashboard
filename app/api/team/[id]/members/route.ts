import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    console.log(
      `[API] GET /api/team/${teamId}/members - Fetching team members`
    );

    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a member of the team
    const userMembership = await db.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: Number(session.user.id),
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
      );
    }

    // Get all team members for the specified team
    const teamMembers = await db.teamMember.findMany({
      where: {
        teamId: teamId,
      },
      include: {
        user: true,
        permissions: true,
      },
    });

    console.log(
      `[API] GET /api/team/${teamId}/members - Found ${teamMembers.length} members`
    );
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error(`[API] GET /api/team/${params.id}/members - Error:`, error);
    return NextResponse.json(
      {
        error: "Failed to fetch team members",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    const data = await request.json();
    console.log(
      `[API] POST /api/team/${teamId}/members - Adding member with email: ${data.email}`
    );

    // Get the authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is an admin of the team
    const userMembership = await db.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: Number(session.user.id),
        permissions: {
          manageTeam: true,
        },
      },
      include: {
        permissions: true,
      },
    });

    if (!userMembership || !userMembership.permissions?.manageTeam) {
      return NextResponse.json(
        { error: "You don't have permission to add members to this team" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
    });

    // If user doesn't exist, create a new one
    let userId;
    if (!user) {
      console.log(
        `[API] POST /api/team/${teamId}/members - User not found, creating new user`
      );
      const newUser = await db.user.create({
        data: {
          email: data.email,
          name: data.name || data.email.split("@")[0], // Use part of email as name if not provided
        },
      });
      userId = newUser.id;
      console.log(
        `[API] POST /api/team/${teamId}/members - Created new user with ID: ${userId}`
      );
    } else {
      userId = user.id;
      console.log(
        `[API] POST /api/team/${teamId}/members - Found existing user with ID: ${userId}`
      );
    }

    // Check if the user is already a member of the team
    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (existingMember) {
      console.log(
        `[API] POST /api/team/${teamId}/members - User is already a member of this team`
      );
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Create new team member with permissions
    const teamMember = await db.teamMember.create({
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
    });

    console.log(
      `[API] POST /api/team/${teamId}/members - Added member with ID: ${teamMember.id}`
    );
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error(`[API] POST /api/team/${params.id}/members - Error:`, error);
    return NextResponse.json(
      {
        error: "Failed to add team member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
