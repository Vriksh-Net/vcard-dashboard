"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, Save, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "../../../../hooks/use-toast";
import { Input } from "@/components/ui/input";
import { use } from "react";

export default function NFCSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { toast } = useToast();
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update the vCardLink to use the correct path
  const vCardLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/vcard/${id}`;

  const handleLinkNFC = async () => {
    setIsLinking(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "NFC Card Linked",
        description: "Your vCard has been successfully linked to the NFC card.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error Linking NFC Card",
        description:
          "There was a problem linking your NFC card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "NFC Settings Saved",
      description: "Your NFC settings have been successfully updated.",
      variant: "success",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vCardLink);
    setCopied(true);

    toast({
      title: "Link Copied",
      description: "vCard link has been copied to clipboard.",
      variant: "success",
    });

    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-2xl font-bold tracking-tight">NFC Settings</h1>
          <p className="text-muted-foreground">
            Configure NFC card integration for this vCard
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>NFC Configuration</CardTitle>
              <CardDescription>
                Enable and configure NFC functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="nfc-toggle">Enable NFC</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this vCard to be programmed to NFC cards
                  </p>
                </div>
                <Switch
                  id="nfc-toggle"
                  checked={nfcEnabled}
                  onCheckedChange={setNfcEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>vCard Link</Label>
                <div className="flex items-center gap-2">
                  <Input value={vCardLink} readOnly className="flex-1" />
                  <Button size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the link that will be programmed to your NFC card
                </p>
              </div>

              <div className="space-y-2">
                <Label>NFC Card ID</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">NFC-12345-ABCDE</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the unique identifier for the NFC card linked to this
                  vCard
                </p>
              </div>

              <div className="space-y-2">
                <Label>Last Programmed</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    March 15, 2024 at 2:30 PM
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Scans</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <span className="text-muted-foreground">42</span>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                variant="secondary"
                onClick={handleLinkNFC}
                disabled={isLinking || !nfcEnabled}
              >
                {isLinking ? "Linking..." : "Link New NFC Card"}
              </Button>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" onClick={handleSaveSettings}>
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>

          <Alert className="bg-green-50 border-green-200 text-green-900">
            <Smartphone className="h-4 w-4" />
            <AlertTitle>NFC Card Required</AlertTitle>
            <AlertDescription>
              You need a compatible NFC card to program this vCard. You can
              order NFC cards from our store or use compatible third-party
              cards.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How to Program NFC Cards</CardTitle>
              <CardDescription>
                Follow these steps to program your NFC card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-sm">
                  <span className="font-medium">Enable NFC on this vCard</span>
                  <p className="ml-6 text-muted-foreground">
                    Toggle the NFC switch to enable NFC functionality for this
                    vCard.
                  </p>
                </li>
                <li className="text-sm">
                  <span className="font-medium">Get a compatible NFC card</span>
                  <p className="ml-6 text-muted-foreground">
                    Ensure you have an NTAG213/215/216 compatible NFC card or
                    sticker.
                  </p>
                </li>
                <li className="text-sm">
                  <span className="font-medium">Download our mobile app</span>
                  <p className="ml-6 text-muted-foreground">
                    Our mobile app is required to program the NFC card with your
                    vCard data.
                  </p>
                </li>
                <li className="text-sm">
                  <span className="font-medium">Scan and program</span>
                  <p className="ml-6 text-muted-foreground">
                    Open the app, select this vCard, and tap your phone to the
                    NFC card to program it.
                  </p>
                </li>
                <li className="text-sm">
                  <span className="font-medium">Test your NFC card</span>
                  <p className="ml-6 text-muted-foreground">
                    Tap the programmed NFC card to any NFC-enabled smartphone to
                    test.
                  </p>
                </li>
              </ol>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Order NFC Cards</Button>
              <Button variant="outline">Download App</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Track usage of your NFC card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">
                  NFC scan analytics will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
