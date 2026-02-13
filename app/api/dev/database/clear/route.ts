import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function POST() {
  try {
    const { db } = await connectToDatabase()

    const collections = ["books", "users", "orders", "addresses", "carts", "newsletter_subscribers", "coupons"]
    
    for (const collectionName of collections) {
      await db.collection(collectionName).deleteMany({})
    }

    return NextResponse.json({ 
      success: true, 
      message: "All collections cleared successfully" 
    })
  } catch (error) {
    console.error("Error clearing database:", error)
    return NextResponse.json(
      { success: false, error: "Failed to clear database" },
      { status: 500 }
    )
  }
}
