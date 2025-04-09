import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(request: Request, { params }: { params: { id: string; memberId: string } }) {
  try {
    const { permissions } = await request.json()

    // Validate required fields
    if (!permissions) {
      return NextResponse.json({ error: "Permissions are required" }, { status: 400 })
    }

    // Check if team member exists
    const existingMember = await db.teamMember.findFirst({
      where: {
        id: params.memberId,
        teamId: params.id,
      },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    // Update team member permissions
    const updatedMember = await db.teamMember.update({
      where: {
        id: params.memberId,
      },
      data: {
        permissions: {
          update: {
            createCards: permissions.createCards,
            editCards: permissions.editCards,
            deleteCards: permissions.deleteCards,
            manageTeam: permissions.manageTeam,
          },
        },
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

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating team member permissions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; memberId: string } }) {
  try {
    // Check if team member exists
    const existingMember = await db.teamMember.findFirst({
      where: {
        id: params.memberId,
        teamId: params.id,
      },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    // Delete team member permissions first (to avoid foreign key constraint issues)
    await db.teamMemberPermission.delete({
      where: {
        teamMemberId: params.memberId,
      },
    })

    // Delete team member
    await db.teamMember.delete({
      where: {
        id: params.memberId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

