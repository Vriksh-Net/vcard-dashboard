import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

//! Use connection pooling in production
const prismaClientSingleton = () => {
  //! Use the DATABASE_URL from environment variables directly
  const databaseUrl = process.env.DATABASE_URL
//   console.log("[Prisma] Connecting to database:", databaseUrl!.replace(/:[^:]*@/, ":****@"))

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  })
}

export const db = globalThis.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db
}



