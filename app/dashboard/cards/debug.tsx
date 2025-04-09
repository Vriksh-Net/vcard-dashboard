"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react"

export default function DebugVCards() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any | null>(null)

  const testFetchVCards = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      console.log("Debug: Testing fetch vCards...")
      const response = await fetch("/api/vcards", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Add this to prevent caching
      })

      console.log("Debug: Response status:", response.status)
      console.log("Debug: Response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("Debug: Raw API response:", responseText)

      let jsonData
      try {
        jsonData = JSON.parse(responseText)
        console.log("Debug: Parsed vCards data:", jsonData)
      } catch (e) {
        setError(`Failed to parse JSON: ${e}. Raw response: ${responseText}`)
        return
      }

      if (!response.ok) {
        setError(`API returned error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(jsonData)}`)
        return
      }

      setData(jsonData)
    } catch (error) {
      console.error("Debug: Fetch error:", error)
      setError(`Fetch error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Debug Tool</CardTitle>
        <CardDescription>Test the vCards API endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">API Response:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testFetchVCards} disabled={loading}>
          {loading ? "Testing..." : "Test Fetch vCards"}
        </Button>
      </CardFooter>
    </Card>
  )
}

