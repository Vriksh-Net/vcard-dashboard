import Link from "next/link";
import { CreditCard, Users, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  // Fetch actual data from the database
  let totalVCards = 0;
  let totalTeamMembers = 0;
  let nfcScans = 0;
  let recentVCards: any[] = [];

  try {
    // Get total vCards count
    totalVCards = await db.vCard.count();

    // Get total team members count
    totalTeamMembers = await db.teamMember.count();

    // Get NFC scan count
    nfcScans = await db.scanLog.count({
      where: {
        scanType: "NFC",
      },
    });

    //! Get recent vCards
    recentVCards = await db.vCard.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Keep the counts at 0 if there's an error
  }

  // Format the date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your digital vCards and NFC integrations
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vCards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVCards}</div>
            <p className="text-xs text-muted-foreground">
              Total vCards in the system
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/cards" className="w-full">
              <Button variant="outline" className="w-full">
                View all
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeamMembers}</div>
            <p className="text-xs text-muted-foreground">Total team members</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/team" className="w-full">
              <Button variant="outline" className="w-full">
                Manage team
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFC Scans</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nfcScans}</div>
            <p className="text-xs text-muted-foreground">Total NFC scans</p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/analytics" className="w-full">
              <Button variant="outline" className="w-full">
                View analytics
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your vCard activity for the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded-md">
              <p className="text-sm text-muted-foreground">
                Activity chart will appear here
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent vCards</CardTitle>
            <CardDescription>
              Your recently created or updated vCards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVCards.length > 0 ? (
                recentVCards.map((vCard: any) => (
                  <div key={vCard.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {vCard.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {vCard.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(vCard.updatedAt)}
                      </p>
                    </div>
                    <Link href={`/dashboard/cards/${vCard.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-24">
                  <p className="text-sm text-muted-foreground">
                    No vCards found
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/cards" className="w-full">
              <Button variant="outline" className="w-full">
                View all vCards
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
