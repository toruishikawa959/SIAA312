import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"

/**
 * PATCH /api/admin/orders/[id]
 * Update order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, notes } = await request.json()

    // Validate status
    const validStatuses = ["pending", "processing", "confirmed", "preparing", "ready_for_pickup", "shipped", "delivered", "completed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
          ...(notes && { notes }),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Order updated",
    })
  } catch (err) {
    console.error("[Admin] Update order error:", err)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
