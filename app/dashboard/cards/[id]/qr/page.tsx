"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "../../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function QRCodePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { toast } = useToast();
  const [qrSize, setQrSize] = useState("medium");
  const [isDownloading, setIsDownloading] = useState(false);

  // In a real app, this would be generated from the vCard data
  const qrCodeUrl = `/placeholder.svg?height=300&width=300`;

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "QR Code Downloaded",
        description: "Your QR code has been successfully downloaded.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description:
          "There was a problem downloading your QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    //! In a real app, this would open a share dialog
    toast({
      title: "QR Code Shared",
      description: "Your QR code link has been copied to clipboard.",
      variant: "success",
    });
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cards/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Code</h1>
          <p className="text-muted-foreground">
            View and download QR code for this vCard
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>vCard QR Code</CardTitle>
            <CardDescription>
              Scan this QR code to view this vCard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-lg border p-4 bg-white w-full max-w-[300px] mx-auto">
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="QR Code"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              className="gap-2"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
              <CardDescription>Customize your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-size">QR Code Size</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
                  <SelectTrigger id="qr-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (200x200)</SelectItem>
                    <SelectItem value="medium">Medium (300x300)</SelectItem>
                    <SelectItem value="large">Large (400x400)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Instructions</CardTitle>
              <CardDescription>How to use your QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Print Your QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Download and print your QR code to include on business
                    cards, brochures, or promotional materials.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Digital Display</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your QR code digitally via email or social media for
                    easy scanning.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Anyone can scan your QR code with their smartphone camera to
                    instantly view your vCard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
