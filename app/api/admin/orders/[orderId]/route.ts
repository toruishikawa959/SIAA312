import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { sendOrderStatusUpdateEmail, sendStaffOrderAlert } from "@/lib/email-service"

/**
 * PATCH /api/admin/orders/[orderId]
 * Update order status (staff/admin only)
 * Body: { status: "confirmed" | "preparing" | "ready_for_pickup" | "shipped" | "delivered" | "cancelled" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const { status, notes } = await request.json()

    // Validate status
    const validStatuses = [
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "shipped",
      "delivered",
      "cancelled",
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    // Find order
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Determine timestamp field based on status
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (status === "confirmed") {
      updateData.confirmedAt = new Date()
    } else if (status === "ready_for_pickup") {
      updateData.readyForPickupAt = new Date()
    } else if (status === "shipped") {
      updateData.shippedAt = new Date()
    } else if (status === "delivered") {
      updateData.deliveredAt = new Date()
    }

    if (notes) {
      updateData.notes = notes
    }

    // Update order
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      )
    }

    // Send email to customer
    const email = order.guestEmail || order.userId?.email
    const name = order.guestName || order.userId?.firstName

    if (email) {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed and is being prepared!",
        preparing: "Your order is being carefully prepared.",
        ready_for_pickup: "Your order is ready for pickup! Visit our store to collect it.",
        shipped: "Your order is on the way! 🚚",
        delivered: "Your order has been delivered. Thank you!",
        cancelled: "Your order has been cancelled.",
      }

      try {
        await sendOrderStatusUpdateEmail({
          email,
          name: name || "Valued Customer",
          orderId,
          status,
          message: statusMessages[status] || "Your order status has been updated.",
        })
      } catch (emailError) {
        console.error("Failed to send status email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      orderId,
      updatedOrder: updateData,
    })
  } catch (err) {
    console.error("[Admin] Order update error:", err)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/orders/[orderId]
 * Get order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (err) {
    console.error("[Admin] Order fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}
