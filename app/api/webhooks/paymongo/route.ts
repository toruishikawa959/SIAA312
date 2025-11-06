import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendStaffOrderAlert } from "@/lib/email-service"
import { incrementCouponUsage } from "@/lib/coupon-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.data

    console.log("[PayMongo Webhook] Received event:", event.attributes.type)

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    // Handle different webhook event types
    switch (event.attributes.type) {
      case "payment.paid": {
        // Payment was successful
        const paymentData = event.attributes.data
        const paymentIntentId = paymentData.attributes.payment_intent_id

        console.log("[PayMongo Webhook] Payment successful for intent:", paymentIntentId)

        // Find the order
        const order = await ordersCollection.findOne({
          paymongoPaymentIntentId: paymentIntentId,
        })

        if (!order) {
          console.error("[PayMongo Webhook] Order not found for intent:", paymentIntentId)
          break
        }

        // Update order status to paid
        await ordersCollection.updateOne(
          { paymongoPaymentIntentId: paymentIntentId },
          {
            $set: {
              paymentStatus: "paid",
              paymentId: paymentData.id,
              paidAt: new Date(),
              status: "confirmed",
              confirmedAt: new Date(),
            },
          }
        )

        console.log("[PayMongo Webhook] Order marked as paid and confirmed")

        // Increment coupon usage if a coupon was used
        if (order.couponCode) {
          try {
            await incrementCouponUsage(order.couponCode)
            console.log("[PayMongo Webhook] Coupon usage incremented:", order.couponCode)
          } catch (couponError) {
            console.error("[PayMongo Webhook] Failed to increment coupon usage:", couponError)
            // Don't fail the webhook if coupon increment fails
          }
        }

        // Send confirmation email to customer
        try {
          await sendOrderConfirmationEmail({
            email: order.guestEmail || order.userId?.email,
            name: order.guestName || order.userId?.firstName,
            orderId: order._id.toString(),
            items: order.items.map((item: any) => ({
              title: item.title,
              quantity: item.quantity,
              price: item.price * item.quantity,
            })),
            totalAmount: order.totalAmount,
            deliveryMethod: order.deliveryMethod,
            address: order.guestAddress || order.shippingAddress,
          })
          console.log("[PayMongo Webhook] Confirmation email sent")
        } catch (emailError) {
          console.error("[PayMongo Webhook] Failed to send confirmation email:", emailError)
        }

        // Send staff alert
        try {
          const staffEmail = process.env.STAFF_ALERT_EMAIL || "admin@sierbosten.com"
          await sendStaffOrderAlert({
            email: staffEmail,
            orderId: order._id.toString(),
            items: order.items,
            deliveryMethod: order.deliveryMethod,
            customerName: order.guestName || "Guest",
            customerPhone: order.guestPhone || "N/A",
          })
          console.log("[PayMongo Webhook] Staff alert sent")
        } catch (emailError) {
          console.error("[PayMongo Webhook] Failed to send staff alert:", emailError)
        }

        break
      }

      case "payment.failed": {
        // Payment failed
        const paymentData = event.attributes.data
        const paymentIntentId = paymentData.attributes.payment_intent_id
        const failedCode = paymentData.attributes.failed_code
        const failedMessage = paymentData.attributes.failed_message

        console.log(
          `[PayMongo Webhook] Payment failed for intent ${paymentIntentId}: ${failedCode} - ${failedMessage}`
        )

        // Update order status to failed
        await ordersCollection.updateOne(
          { paymongoPaymentIntentId: paymentIntentId },
          {
            $set: {
              paymentStatus: "failed",
              paymentFailedReason: failedMessage,
              paymentFailedCode: failedCode,
              failedAt: new Date(),
              status: "payment_failed",
            },
          }
        )

        console.log("[PayMongo Webhook] Order marked as failed")
        break
      }

      case "qrph.expired": {
        // QR Ph code expired (30 minutes passed)
        const qrphData = event.attributes.data
        const paymentIntentId = qrphData.attributes.payment_intent_id

        console.log("[PayMongo Webhook] QR Ph code expired for intent:", paymentIntentId)

        // Update order to indicate QR code expired
        await ordersCollection.updateOne(
          { paymongoPaymentIntentId: paymentIntentId },
          {
            $set: {
              paymentStatus: "expired",
              qrCodeExpiredAt: new Date(),
              status: "qrcode_expired",
            },
          }
        )

        console.log("[PayMongo Webhook] Order marked as QR code expired")
        break
      }

      default: {
        console.log("[PayMongo Webhook] Unknown event type:", event.attributes.type)
      }
    }

    // Respond to PayMongo with 200 to confirm webhook received
    return NextResponse.json(
      { success: true, message: "Webhook processed" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PayMongo Webhook] Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
