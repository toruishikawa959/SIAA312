import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { sendOrderConfirmationEmail, sendStaffOrderAlert } from "@/lib/email-service"

/**
 * TEST ENDPOINT ONLY - Simulates a paid PayMongo webhook
 * Use: GET or POST /api/test/mock-payment?orderId=xxx
 * This marks an order as paid for testing purposes
 */
async function handleMockPayment(request: NextRequest) {
  // Security: Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Test endpoints disabled in production" },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId query parameter required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    // Find the order first
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Update order to paid status
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          confirmedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail({
        email: order.guestEmail || order.userId?.email,
        name: order.guestName || order.userId?.firstName,
        orderId,
        items: order.items.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price * item.quantity,
        })),
        totalAmount: order.totalAmount,
        deliveryMethod: order.deliveryMethod,
        address: order.guestAddress || order.shippingAddress,
      })
      console.log("[TEST] Confirmation email sent")
    } catch (emailError) {
      console.error("[TEST] Failed to send email:", emailError)
    }

    // Send staff alert
    try {
      const staffEmail = process.env.STAFF_ALERT_EMAIL || "admin@sierbosten.com"
      await sendStaffOrderAlert({
        email: staffEmail,
        orderId,
        items: order.items,
        deliveryMethod: order.deliveryMethod,
        customerName: order.guestName || "Guest",
        customerPhone: order.guestPhone || "N/A",
      })
      console.log("[TEST] Staff alert sent")
    } catch (emailError) {
      console.error("[TEST] Failed to send staff alert:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as paid and emails sent",
      orderId,
    })
  } catch (err) {
    console.error("[TEST] Mock payment error:", err)
    return NextResponse.json(
      { error: "Failed to mock payment" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleMockPayment(request)
}

export async function POST(request: NextRequest) {
  return handleMockPayment(request)
}
