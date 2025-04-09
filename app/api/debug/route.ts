import { NextResponse } from "next/server";

export async function GET(request: Request) {
  //! List all available API routes for debugging
  const routes = [
    { path: "/api/vcards", methods: ["GET", "POST"] },
    { path: "/api/create-vcard", methods: ["POST"] },
    { path: "/api/vcards/[id]", methods: ["GET", "PUT", "DELETE"] },
    { path: "/api/vcards/analytics", methods: ["GET"] },
    { path: "/api/vcards/[id]/qr", methods: ["GET"] },
    { path: "/api/vcards/[id]/nfc", methods: ["GET", "POST"] },
  ];

  return NextResponse.json({
    message: "API Debug Information",
    availableRoutes: routes,
    timestamp: new Date().toISOString(),
  });
}
