import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const teamId = params.id;
    const memberId = params.memberId;
    const data = await request.json();

    console.log(
      `[API] PATCH /api/team/${teamId}/members/${memberId} - Updating member permissions`
    );

    // Verify the team member exists
    const teamMember = await db.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId,
      },
      include: {
        permissions: true,
      },
    });

    if (!teamMember) {
      console.log(
        `[API] PATCH /api/team/${teamId}/members/${memberId} - Team member not found`
      );
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Update permissions if provided
    if (data.permissions) {
      console.log(
        `[API] PATCH /api/team/${teamId}/members/${memberId} - Updating permissions:`,
        data.permissions
      );

      await db.teamMemberPermission.update({
        where: {
          id: teamMember.permissions?.id,
        },
        data: {
          createCards:
            data.permissions.createCards !== undefined
              ? data.permissions.createCards
              : teamMember.permissions?.createCards,
          editCards:
            data.permissions.editCards !== undefined
              ? data.permissions.editCards
              : teamMember.permissions?.editCards,
          deleteCards:
            data.permissions.deleteCards !== undefined
              ? data.permissions.deleteCards
              : teamMember.permissions?.deleteCards,
          manageTeam:
            data.permissions.manageTeam !== undefined
              ? data.permissions.manageTeam
              : teamMember.permissions?.manageTeam,
        },
      });
    }

    // Update role if provided
    if (data.role) {
      console.log(
        `[API] PATCH /api/team/${teamId}/members/${memberId} - Updating role to: ${data.role}`
      );

      await db.teamMember.update({
        where: {
          id: memberId,
        },
        data: {
          role: data.role,
        },
      });
    }

    // Get the updated team member
    const updatedTeamMember = await db.teamMember.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
        permissions: true,
      },
    });

    console.log(
      `[API] PATCH /api/team/${teamId}/members/${memberId} - Member updated successfully`
    );
    return NextResponse.json(updatedTeamMember);
  } catch (error) {
    console.error(
      `[API] PATCH /api/team/${params.id}/members/${params.memberId} - Error:`,
      error
    );
    return NextResponse.json(
      {
        error: "Failed to update team member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const teamId = params.id;
    const memberId = params.memberId;

    console.log(
      `[API] DELETE /api/team/${teamId}/members/${memberId} - Removing team member`
    );

    // Verify the team member exists
    const teamMember = await db.teamMember.findFirst({
      where: {
        id: memberId,
        teamId: teamId,
      },
    });

    if (!teamMember) {
      console.log(
        `[API] DELETE /api/team/${teamId}/members/${memberId} - Team member not found`
      );
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Delete the team member's permissions first
    await db.teamMemberPermission.deleteMany({
      where: {
        teamMemberId: memberId,
      },
    });

    // Delete the team member
    await db.teamMember.delete({
      where: {
        id: memberId,
      },
    });

    console.log(
      `[API] DELETE /api/team/${teamId}/members/${memberId} - Member removed successfully`
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `[API] DELETE /api/team/${params.id}/members/${params.memberId} - Error:`,
      error
    );
    return NextResponse.json(
      {
        error: "Failed to remove team member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
