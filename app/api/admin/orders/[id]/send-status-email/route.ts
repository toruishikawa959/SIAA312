import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { sendOrderStatusUpdateEmail } from "@/lib/email-service"

/**
 * Sends status update email to customer when order status changes
 * POST /api/admin/orders/[id]/send-status-email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, email, name } = await request.json()

    if (!status || !email || !name) {
      return NextResponse.json(
        { error: "Missing required fields: status, email, name" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    // Get order details
    const order = await ordersCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Status-specific messages
    const statusMessages: Record<string, string> = {
      pending: "Your order has been received and is waiting for confirmation.",
      confirmed: "Your order has been confirmed! We'll start preparing it soon.",
      processing: "We're processing your order. It will be ready soon!",
      preparing: "We're preparing your order. It will be ready soon!",
      ready_for_pickup: "Your order is ready for pickup! Visit our store to collect it.",
      shipped: "Your order is on the way! Check back for tracking updates.",
      delivered: "Your order has been delivered! Thank you for your purchase.",
      completed: "Your order has been completed! Thank you for shopping with us.",
      cancelled: "Your order has been cancelled. If you have questions, please contact us.",
    }

    const message = statusMessages[status] || "Your order status has been updated."

    // Send status update email
    await sendOrderStatusUpdateEmail({
      email,
      name,
      orderId: id,
      status,
      message,
    })

    return NextResponse.json({
      success: true,
      message: "Status update email sent",
    })
  } catch (err) {
    console.error("[SEND STATUS EMAIL] Error:", err)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
