import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collections } = body

    if (!collections || !Array.isArray(collections)) {
      return NextResponse.json(
        { error: "Invalid request: collections array required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Define which collections can be truncated
    const allowedCollections = ["books", "carts", "orders", "inventoryLogs"]

    // Verify all requested collections are allowed
    const invalidCollections = collections.filter(
      (col: string) => !allowedCollections.includes(col)
    )

    if (invalidCollections.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot truncate collections: ${invalidCollections.join(", ")}. Only books, carts, orders, and inventoryLogs can be truncated.`,
        },
        { status: 403 }
      )
    }

    // Truncate each collection
    const results: Record<string, number> = {}

    for (const collection of collections) {
      try {
        const result = await db.collection(collection).deleteMany({})
        results[collection] = result.deletedCount
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to truncate ${collection}: ${error}` },
          { status: 500 }
        )
      }
    }

    // Log the action
    try {
      await db.collection("auditLogs").insertOne({
        action: "truncate_data",
        collections: collections,
        deletedCounts: results,
        timestamp: new Date(),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      })
    } catch (error) {
      console.error("Failed to log truncation action:", error)
    }

    return NextResponse.json({
      message: "Data truncated successfully",
      results,
      summary: `Deleted ${Object.values(results).reduce((a: number, b: number) => a + b, 0)} total documents`,
    })
  } catch (error) {
    console.error("Truncation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
