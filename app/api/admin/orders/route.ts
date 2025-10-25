import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/admin/orders
 * List all orders with optional filtering
 * Query params: ?status=confirmed&deliveryMethod=pickup&limit=50
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const deliveryMethod = searchParams.get("deliveryMethod")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    // Build filter
    const filter: any = {}
    if (status) filter.status = status
    if (deliveryMethod) filter.deliveryMethod = deliveryMethod

    // Fetch orders
    const orders = await ordersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await ordersCollection.countDocuments(filter)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("[Admin] Orders list error:", err)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
