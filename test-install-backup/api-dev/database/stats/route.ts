import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const stats = {
      books: await db.collection("books").countDocuments(),
      users: await db.collection("users").countDocuments(),
      orders: await db.collection("orders").countDocuments(),
      addresses: await db.collection("addresses").countDocuments(),
      carts: await db.collection("carts").countDocuments(),
      newsletters: await db.collection("newsletter_subscribers").countDocuments(),
      coupons: await db.collection("coupons").countDocuments(),
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error fetching database stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch database stats" },
      { status: 500 }
    )
  }
}
