"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "../../../hooks/use-toast";
import Link from "next/link";

// Sample data for demonstration
const qrCodes = [
  {
    id: 1,
    name: "John Doe",
    createdAt: "Jan 15, 2024",
    scans: 120,
    lastScan: "Today",
  },
  {
    id: 2,
    name: "Marketing Team",
    createdAt: "Feb 2, 2024",
    scans: 90,
    lastScan: "Yesterday",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    createdAt: "Feb 10, 2024",
    scans: 60,
    lastScan: "3 days ago",
  },
  {
    id: 4,
    name: "Technical Support",
    createdAt: "Mar 5, 2024",
    scans: 25,
    lastScan: "1 week ago",
  },
];

export default function QRCodesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQRCodes = qrCodes.filter((qr) =>
    qr.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (name: string) => {
    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${name} has been downloaded.`,
      variant: "success",
    });
  };

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-muted-foreground">
            Manage and download QR codes for your vCards
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search QR codes..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredQRCodes.map((qr) => (
          <Card key={qr.id}>
            <CardHeader className="pb-2">
              <CardTitle>{qr.name}</CardTitle>
              <CardDescription>Created on {qr.createdAt}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="rounded-lg border p-4 bg-white w-[150px] h-[150px] flex items-center justify-center">
                <QrCode className="h-full w-full text-primary" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <div className="flex w-full justify-between text-sm">
                <span className="text-muted-foreground">Scans: {qr.scans}</span>
                <span className="text-muted-foreground">
                  Last scan: {qr.lastScan}
                </span>
              </div>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownload(qr.name)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Link href={`/dashboard/cards/${qr.id}/qr`} className="flex-1">
                  <Button className="w-full">View Details</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredQRCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No QR codes found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? "Try a different search term"
              : "Create vCards to generate QR codes"}
          </p>
        </div>
      )}
    </div>
  );
}
