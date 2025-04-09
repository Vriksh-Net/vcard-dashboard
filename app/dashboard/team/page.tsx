"use client"

import { useEffect, useState } from "react"
import { PlusCircle, Search, MoreHorizontal, Mail, Phone, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useToast } from "../../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

//! Define types for our team members
type TeamMember = {
  id: string
  name: string
  role: string
  status: string
  user: {
    name: string | null
    email: string | null
    phone?: string | null
    image?: string | null
    vCards: any[]
  }
  permissions: {
    createCards: boolean
    editCards: boolean
    deleteCards: boolean
    manageTeam: boolean
  }
}

export default function TeamPage() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching team members from API...")

        // Fetch team members from the API
        const response = await fetch("/api/team", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched team data:", data)

        //! Transform the API response to match our expected format
        const formattedTeamMembers = data.flatMap((team: { members: any[] }) =>
          team.members.map((member) => ({
            id: member.id,
            name: member.user?.name || "Unknown",
            role: member.role,
            status: "active",
            user: {
              name: member.user?.name || "Unknown",
              email: member.user?.email || "No email",
              phone: member.user?.phone || null,
              vCards: [],
            },
            permissions: member.permissions || {
              createCards: false,
              editCards: false,
              deleteCards: false,
              manageTeam: false,
            },
          })),
        )

        setTeamMembers(formattedTeamMembers)
      } catch (error) {
        console.error("Error fetching team members:", error)
        toast({
          title: "Error",
          description: "Failed to load team members.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [toast])

  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Viewer",
  })

  const [permissions, setPermissions] = useState({
    createCards: false,
    editCards: false,
    deleteCards: false,
    manageTeam: false,
  })

  const handleAddMember = async () => {
    try {
      // Validate required fields
      if (!newMember.email) {
        toast({
          title: "Missing Information",
          description: "Email is required to add a team member.",
          variant: "destructive",
        })
        return
      }

      // First, get the team ID (for simplicity, we'll use the first team)
      const teamsResponse = await fetch("/api/team")
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams")
      }

      const teams = await teamsResponse.json()
      if (!teams || teams.length === 0) {
        // Create a new team if none exists
        const createTeamResponse = await fetch("/api/team", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "My Team",
            description: "Default team",
          }),
        })

        if (!createTeamResponse.ok) {
          throw new Error("Failed to create team")
        }

        const newTeam = await createTeamResponse.json()
        var teamId = newTeam.id
      } else {
        var teamId = teams[0].id
      }

      // Now add the member to the team
      const response = await fetch(`/api/team/${teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMember.email,
          name: newMember.name,
          role: newMember.role,
          permissions: {
            createCards: newMember.role === "Administrator" || newMember.role === "Manager",
            editCards:
              newMember.role === "Administrator" || newMember.role === "Manager" || newMember.role === "Editor",
            deleteCards: newMember.role === "Administrator" || newMember.role === "Manager",
            manageTeam: newMember.role === "Administrator",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add team member")
      }

      const addedMember = await response.json()
      console.log("Added team member:", addedMember)

      toast({
        title: "Team Member Added",
        description: `${newMember.name || newMember.email} has been added to your team.`,
        variant: "success",
      })

      setIsAddDialogOpen(false)
      setNewMember({
        name: "",
        email: "",
        phone: "",
        role: "Viewer",
      })

      // Refresh the team members list
      const updatedTeamsResponse = await fetch("/api/team")
      if (updatedTeamsResponse.ok) {
        const updatedTeams = await updatedTeamsResponse.json()
        const formattedTeamMembers = updatedTeams.flatMap((team: { members: { id: any; user: { name: any; email: any; phone: any }; role: any; permissions: any }[] }) =>
          team.members.map((member: { id: any; user: { name: any; email: any; phone: any }; role: any; permissions: any }) => ({
            id: member.id,
            name: member.user?.name || "Unknown",
            role: member.role,
            status: "active",
            user: {
              name: member.user?.name || "Unknown",
              email: member.user?.email || "No email",
              phone: member.user?.phone || null,
              vCards: [],
            },
            permissions: member.permissions || {
              createCards: false,
              editCards: false,
              deleteCards: false,
              manageTeam: false,
            },
          })),
        )

        setTeamMembers(formattedTeamMembers)
      }
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add team member",
        variant: "destructive",
      })
    }
  }

  const handleOpenPermissions = async (memberId: string) => {
    try {
      const member = teamMembers.find((m) => m.id === memberId)
      if (member) {
        setPermissions({
          createCards: member.permissions?.createCards || false,
          editCards: member.permissions?.editCards || false,
          deleteCards: member.permissions?.deleteCards || false,
          manageTeam: member.permissions?.manageTeam || false,
        })
        setSelectedMember(memberId)
        setIsPermissionsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch member permissions",
        variant: "destructive",
      })
    }
  }

  const handleSavePermissions = async () => {
    try {
      if (!selectedMember) {
        throw new Error("No member selected")
      }

      // Find the team ID for this member
      const member = teamMembers.find((m) => m.id === selectedMember)
      if (!member) {
        throw new Error("Member not found")
      }

      // Get all teams to find which team this member belongs to
      const teamsResponse = await fetch("/api/team")
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams")
      }

      const teams = await teamsResponse.json()
      let teamId = null

      // Find which team this member belongs to
      for (const team of teams) {
        const foundMember = team.members.find((m: any) => m.id === selectedMember)
        if (foundMember) {
          teamId = team.id
          break
        }
      }

      if (!teamId) {
        throw new Error("Could not determine team for this member")
      }

      // Update the permissions
      const response = await fetch(`/api/team/${teamId}/members/${selectedMember}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: permissions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update permissions")
      }

      toast({
        title: "Permissions Updated",
        description: "Team member permissions have been updated successfully.",
        variant: "success",
      })

      setIsPermissionsDialogOpen(false)

      // Refresh the team members list
      const updatedTeamsResponse = await fetch("/api/team")
      if (updatedTeamsResponse.ok) {
        const updatedTeams = await updatedTeamsResponse.json()
        const formattedTeamMembers = updatedTeams.flatMap((team: { members: any[] }) =>
          team.members.map((member) => ({
            id: member.id,
            name: member.user?.name || "Unknown",
            role: member.role,
            status: "active",
            user: {
              name: member.user?.name || "Unknown",
              email: member.user?.email || "No email",
              phone: member.user?.phone || null,
              vCards: [],
            },
            permissions: member.permissions || {
              createCards: false,
              editCards: false,
              deleteCards: false,
              manageTeam: false,
            },
          })),
        )

        setTeamMembers(formattedTeamMembers)
      }
    } catch (error) {
      console.error("Error updating permissions:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update permissions",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (memberId: string, name: string) => {
    try {
      // Find the team ID for this member
      const teamsResponse = await fetch("/api/team")
      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams")
      }

      const teams = await teamsResponse.json()
      let teamId = null

      // Find which team this member belongs to
      for (const team of teams) {
        const foundMember = team.members.find((m: any) => m.id === memberId)
        if (foundMember) {
          teamId = team.id
          break
        }
      }

      if (!teamId) {
        throw new Error("Could not determine team for this member")
      }

      // Delete the member
      const response = await fetch(`/api/team/${teamId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove team member")
      }

      toast({
        title: "Team Member Removed",
        description: `${name} has been removed from your team.`,
        variant: "success",
      })

      // Refresh the team members list
      const updatedTeamsResponse = await fetch("/api/team")
      if (updatedTeamsResponse.ok) {
        const updatedTeams = await updatedTeamsResponse.json()
        const formattedTeamMembers = updatedTeams.flatMap((team: { members: any[] }) =>
          team.members.map((member) => ({
            id: member.id,
            name: member.user?.name || "Unknown",
            role: member.role,
            status: "active",
            user: {
              name: member.user?.name || "Unknown",
              email: member.user?.email || "No email",
              phone: member.user?.phone || null,
              vCards: [],
            },
            permissions: member.permissions || {
              createCards: false,
              editCards: false,
              deleteCards: false,
              manageTeam: false,
            },
          })),
        )

        setTeamMembers(formattedTeamMembers)
      }
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove team member",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and their access to vCards</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a new member to your team and set their permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search team members..." className="w-full pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">{member.user?.name?.charAt(0) || "?"}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.user?.name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.user?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.user?.phone || "No phone"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Cards:</span>
                  <span className="text-sm">{member.user?.vCards?.length || 0}</span>
                </div>
                <div>
                  {member.status === "active" ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800"
                    >
                      Pending
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenPermissions(member.id)}>
                      Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Member</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Cards</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleRemoveMember(member.id, member.name)}
                    >
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions?.createCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Create vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions?.editCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Edit vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions?.deleteCards ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Delete vCards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                    {member.permissions?.manageTeam ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs">Manage Team</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>Set what this team member can do within your organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Create vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to create new vCards</p>
              </div>
              <Switch
                checked={permissions.createCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, createCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Edit vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to edit existing vCards</p>
              </div>
              <Switch
                checked={permissions.editCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, editCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete vCards</Label>
                <p className="text-sm text-muted-foreground">Allow this member to delete vCards</p>
              </div>
              <Switch
                checked={permissions.deleteCards}
                onCheckedChange={(checked) => setPermissions({ ...permissions, deleteCards: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manage Team</Label>
                <p className="text-sm text-muted-foreground">Allow this member to add, edit, and remove team members</p>
              </div>
              <Switch
                checked={permissions.manageTeam}
                onCheckedChange={(checked) => setPermissions({ ...permissions, manageTeam: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

