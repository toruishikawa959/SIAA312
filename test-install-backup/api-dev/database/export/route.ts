import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function POST() {
  try {
    const { db } = await connectToDatabase()

    const collections = ["books", "users", "orders", "addresses", "carts", "newsletter_subscribers", "coupons"]
    const exportData: any = {}

    for (const collectionName of collections) {
      const data = await db.collection(collectionName).find({}).toArray()
      exportData[collectionName] = data
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bookstore-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error("Error exporting database:", error)
    return NextResponse.json(
      { success: false, error: "Failed to export database" },
      { status: 500 }
    )
  }
}
