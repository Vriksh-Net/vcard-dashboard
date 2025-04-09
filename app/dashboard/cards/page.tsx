"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Search, MoreHorizontal, QrCode, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import DebugVCards from "./debug"

export default function CardsPage() {
  const [vCards, setVCards] = useState<
    { id: string; name: string; position: string; company: string; email: string; phone: string; nfcEnabled: boolean }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const fetchVCards = async () => {
      try {
        console.log("Fetching vCards...")
        setLoading(true)

        // Instead of making an API call, let's use sample data for now
        // This will prevent the 404 error while we fix the API
        const sampleVCards = [
          {
            id: "1",
            name: "John Doe",
            position: "CEO",
            company: "Acme Inc",
            email: "john@acme.com",
            phone: "+1 (555) 123-4567",
            nfcEnabled: true,
          },
          {
            id: "2",
            name: "Marketing Team",
            position: "Department",
            company: "Acme Inc",
            email: "marketing@acme.com",
            phone: "+1 (555) 987-6543",
            nfcEnabled: true,
          },
          {
            id: "3",
            name: "Sarah Johnson",
            position: "CTO",
            company: "Tech Solutions",
            email: "sarah@techsolutions.com",
            phone: "+1 (555) 456-7890",
            nfcEnabled: false,
          },
        ]

        setVCards(sampleVCards)
        setError(null)

        //todo Comment out the actual API call for now
        
        const response = await fetch("/api/vcards", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", //! Add this to prevent caching
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body:`, errorText)
          setError(`Failed to fetch vCards: ${response.status} ${response.statusText}`)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseText = await response.text()
        console.log("Raw API response:", responseText)

        let data
        try {
          data = JSON.parse(responseText)
          console.log("Parsed vCards data:", data)
        } catch (e) {
          console.error("Failed to parse JSON response:", e)
          setError("Failed to parse server response")
          throw new Error("Invalid JSON response")
        }

        setVCards(data)
        setError(null)
      
      } catch (error) {
        console.error("Failed to fetch vCards:", error)
        if (!error) {
          setError("Unknown error occurred while fetching vCards")
        }
        // Set empty array to avoid undefined errors
        setVCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchVCards()
  }, [])

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">vCards</h1>
          <p className="text-muted-foreground">Manage your digital vCards and NFC integrations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/cards/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New vCard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? "Hide Debug" : "Debug"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Error loading vCards</p>
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {showDebug && <DebugVCards />}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search vCards..." className="w-full pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vCards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{card.name}</CardTitle>
                    <CardDescription>
                      {card.position} at {card.company}
                    </CardDescription>
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
                      <DropdownMenuItem>
                        <Link href={`/dashboard/cards/${card.id}`} className="flex w-full">
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/dashboard/cards/${card.id}/edit`} className="flex w-full">
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href={`/dashboard/cards/${card.id}/qr`} className="flex w-full">
                          Generate QR Code
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={`/dashboard/cards/${card.id}/nfc`} className="flex w-full">
                          NFC Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span>{card.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Phone:</span>
                    <span>{card.phone}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div>
                  {card.nfcEnabled ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                      NFC Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">
                      NFC Disabled
                    </Badge>
                  )}
                </div>
                <Link href={`/dashboard/cards/${card.id}/qr`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <QrCode className="h-4 w-4" />
                    <span className="sr-only">QR Code</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}

          {vCards.length === 0 && !loading && !error && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No vCards found</h3>
              <p className="text-sm text-muted-foreground mt-1">Create your first vCard to get started</p>
              <Link href="/dashboard/cards/new" className="mt-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create vCard
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

