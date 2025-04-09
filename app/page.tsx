import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Image from "next/image";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <Image className="flex ml-8" src="/logo.png" alt="Logo" width="90" height="50" />
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Digital vCard Management System
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Create, manage, and share digital vCards with NFC integration
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg">Get Started</Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </section>
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Create vCards</CardTitle>
                <CardDescription>
                  Input contact details to generate digital vCards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Easily create digital vCards with name, contact info, company
                  details, and social media links.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>NFC Integration</CardTitle>
                <CardDescription>Link your vCards to NFC cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Program NFC cards to instantly share your contact information
                  when scanned.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Manage Multiple Cards</CardTitle>
                <CardDescription>Dashboard for all your vCards</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Create and manage multiple vCards for different purposes or
                  team members.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 vCard Manager. All rights reserved by{" "}
            <a href="https://www.vrikshconsulting.com/">Vriksh</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
