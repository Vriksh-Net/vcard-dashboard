"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { use } from "react";
import { toast } from "@/components/ui/use-toast";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [vCard, setVCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVCard = async () => {
      try {
        console.log("Fetching vCard with ID:", id);

        // Fetch vCard data from the API
        const response = await fetch(`/api/vcards/${id}`);

        if (!response.ok) {
          console.error(
            "API response not OK:",
            response.status,
            response.statusText
          );
          throw new Error(`Failed to fetch vCard data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched vCard data:", data);
        setVCard(data);
      } catch (error) {
        console.error("Error fetching vCard:", error);
        // Set a fallback vCard for testing
        setVCard({
          id: id || "unknown",
          name: "Error Loading Card",
          email: "error@example.com",
          phone: "N/A",
          position: "Unknown",
          company: "Unknown",
          website: "",
          address: "",
          bio: "There was an error loading this card.",
          enableNFC: false,
          socialLinks: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVCard();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vCard) {
    return <div>Error: vCard not found</div>;
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cards">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{vCard.name}</h1>
          <p className="text-muted-foreground">
            {vCard.position} at {vCard.company}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/cards/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button size="sm" className="gap-1">
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Personal and business contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {vCard.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{vCard.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {vCard.position} at {vCard.company}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{vCard.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Phone:</span>
                <span>{vCard.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Website:</span>
                <span>{vCard.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Address:</span>
                <span>{vCard.address}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <span className="font-medium">Bio:</span>
              <p className="text-sm">{vCard.bio}</p>
            </div>

            <Separator />

            <div className="space-y-1 mt-4">
              <span className="font-medium">Public URL:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/vcard/${vCard.publicId || id}`}
                  className="text-sm w-full p-2 border rounded"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                      }/vcard/${vCard.publicId || id}`
                    );
                    toast({
                      title: "URL Copied",
                      description:
                        "Public vCard URL has been copied to clipboard.",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this URL to allow others to view your vCard
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connected social media accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {vCard.socialLinks && vCard.socialLinks.length > 0 ? (
                  vCard.socialLinks.map((link: any) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{link.platform}</span>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="link" className="h-auto p-0">
                          {link.url.split("/").pop()}
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No social links found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>NFC Settings</CardTitle>
              <CardDescription>Configure NFC card integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>NFC Status</span>
                  {vCard.enableNFC ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Enabled
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                    >
                      Disabled
                    </Badge>
                  )}
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-center space-y-2">
                    <QrCode className="mx-auto h-24 w-24 text-primary" />
                    <p className="text-sm">
                      Scan this QR code to view this vCard
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/cards/${id}/nfc`} className="w-full">
                <Button variant="outline" className="w-full">
                  Configure NFC
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
