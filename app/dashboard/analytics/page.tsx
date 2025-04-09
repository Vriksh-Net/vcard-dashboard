"use client";

import { useEffect, useState } from "react";
import { BarChart3, QrCode, Smartphone, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [qrScans, setQrScans] = useState(0);
  const [nfcTaps, setNfcTaps] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [totalVCards, setTotalVCards] = useState(0);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setQrScans(data.qrScans);
        setNfcTaps(data.nfcTaps);
        setTotalScans(data.totalScans);
        setTotalVCards(data.totalVCards);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track usage and performance of your vCards
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total vCards</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVCards}</div>
            <p className="text-xs text-muted-foreground">Fetched from database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">Fetched from database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrScans}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFC Taps</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nfcTaps}</div>
            <p className="text-xs text-muted-foreground">
              +24% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vcard-usage">vCard Usage</TabsTrigger>
          <TabsTrigger value="scan-metrics">Scan Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Activity</CardTitle>
              <CardDescription>Total scans over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">
                  Activity chart will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top vCards</CardTitle>
                <CardDescription>Most scanned vCards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["John Doe", "Marketing Team", "Sarah Johnson"].map(
                    (name, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {120 - i * 30} scans
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scan Methods</CardTitle>
                <CardDescription>
                  How your vCards are being accessed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Pie chart will appear here
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm">QR Code</span>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">NFC</span>
                    </div>
                    <span className="text-sm font-medium">32%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vcard-usage" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>vCard Creation Timeline</CardTitle>
              <CardDescription>When vCards were created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">
                  Timeline chart will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>vCard Details</CardTitle>
              <CardDescription>
                Detailed information about each vCard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        vCard Name
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Total Scans
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Last Scan
                      </th>
                      <th scope="col" className="px-4 py-3">
                        NFC Enabled
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3">John Doe</td>
                      <td className="px-4 py-3">Jan 15, 2024</td>
                      <td className="px-4 py-3">120</td>
                      <td className="px-4 py-3">Today</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Marketing Team</td>
                      <td className="px-4 py-3">Feb 2, 2024</td>
                      <td className="px-4 py-3">90</td>
                      <td className="px-4 py-3">Yesterday</td>
                      <td className="px-4 py-3">Yes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">Sarah Johnson</td>
                      <td className="px-4 py-3">Feb 10, 2024</td>
                      <td className="px-4 py-3">60</td>
                      <td className="px-4 py-3">3 days ago</td>
                      <td className="px-4 py-3">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan-metrics" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Locations</CardTitle>
              <CardDescription>
                Geographic distribution of scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">
                  Map visualization will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>Devices used to scan vCards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Device chart will appear here
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm">iOS</span>
                    </div>
                    <span className="text-sm font-medium">55%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Android</span>
                    </div>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm">Other</span>
                    </div>
                    <span className="text-sm font-medium">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time of Day</CardTitle>
                <CardDescription>
                  When vCards are most frequently scanned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Time chart will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

