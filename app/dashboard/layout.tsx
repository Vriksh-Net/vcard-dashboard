"use client";

import type React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Home,
  Menu,
  PlusCircle,
  Settings,
  User,
  Users,
  BarChart3,
  Moon,
  Sun,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "vCards",
    href: "/dashboard/cards",
    icon: CreditCard,
  },
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
    permission: "admin",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState("admin"); // This would come from your auth system
  const { user } = useUser();

  // Ensure theme toggle only renders client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter(
    (item) => !item.permission || item.permission === userRole
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Image className="flex ml-8" src="/logo.png" alt="Logo" width="90" height="50" />
            </div>
            <div className="grid gap-2 py-6">
              <Link
                href="/dashboard/cards/new"
                className="flex items-center gap-2 text-sm font-medium text-primary"
                onClick={() => setOpen(false)}
              >
                <PlusCircle className="h-4 w-4" />
                New vCard
              </Link>
            </div>
            <nav className="grid gap-2 text-sm font-medium">
              {filteredNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold md:hidden">
          <span className="text-lg">vCard Manager</span>
        </div>
        <div className="items-center gap-2 font-semibold hidden md:flex">
          <span className="text-lg">vCard Manager</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {user ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => router.push("/sign-in")}
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Link
              href="/dashboard/cards/new"
              className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              <PlusCircle className="h-4 w-4" />
              New vCard
            </Link>
            <nav className="grid gap-1 py-2">
              {filteredNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-4">
              <div className="px-3 py-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Quick Actions
                </h3>
                <div className="mt-2 grid gap-1">
                  <Link
                    href="/dashboard/cards/qr-codes"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <QrCode className="h-4 w-4" />
                    QR Codes
                  </Link>
                </div>
              </div>

              {mounted && (
                <div className="px-3 py-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="w-full justify-start gap-2"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
