import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import fs from "fs"
import path from "path"

const PAYMONGO_API_KEY = process.env.PAYMONGO_SECRET_KEY

// Helper function to log to file
function logToFile(message: string, data?: any) {
  const logDir = path.join(process.cwd(), "logs")
  const logFile = path.join(logDir, "payment.log")

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}${data ? " " + JSON.stringify(data) : ""}\n`

  fs.appendFileSync(logFile, logMessage)
  console.log(message, data || "")
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYMONGO_API_KEY) {
      return NextResponse.json(
        { error: "PayMongo API key not configured" },
        { status: 500 }
      )
    }

    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    const body = await request.json()
    const { orderId, amount, description, email, name, phone } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Order ID and amount required" },
        { status: 400 }
      )
    }

    const authHeader = `Basic ${Buffer.from(`${PAYMONGO_API_KEY}:`).toString("base64")}`

    logToFile("[QR Ph] Payment Request Received", { orderId, amount, email, name })
    const amountInCents = Math.round(amount * 100)
    logToFile("[QR Ph] Amount conversion", { originalAmount: amount, amountInCents })

    // Step 1: Create a Payment Intent with QR Ph as allowed payment method
    logToFile("[QR Ph] Step 1: Creating Payment Intent")
    const intentResponse = await fetch("https://api.paymongo.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCents,
            payment_method_allowed: ["qrph"],
            currency: "PHP",
            description: `Bookstore Order #${orderId}`,
          },
        },
      }),
    })

    if (!intentResponse.ok) {
      const errorData = await intentResponse.json()
      logToFile("[QR Ph] Step 1 Error - Payment Intent creation failed", errorData)
      return NextResponse.json(
        { error: "Failed to create payment intent", details: errorData },
        { status: 500 }
      )
    }

    const intentData = await intentResponse.json()
    const paymentIntentId = intentData.data.id
    logToFile("[QR Ph] Step 1 Success - Intent ID", { paymentIntentId, amountInCents })

    // Step 2: Create a QR Ph Payment Method
    console.log("[QR Ph] Step 2: Creating QR Ph Payment Method")
    console.log("[QR Ph] Billing details:", { name, email, phone })
    
    const methodResponse = await fetch("https://api.paymongo.com/v1/payment_methods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "qrph",
            billing: {
              name: name || "Bookstore Customer",
              email: email || "customer@bookstore.ph",
              // phone is optional, only include if provided and valid
              ...(phone && phone.trim() ? { phone: phone.trim() } : {}),
            },
          },
        },
      }),
    })

    if (!methodResponse.ok) {
      const errorData = await methodResponse.json()
      console.error("[QR Ph] Step 2 Error - Payment Method creation failed:", errorData)
      return NextResponse.json(
        { error: "Failed to create payment method", details: errorData },
        { status: 500 }
      )
    }

    const methodData = await methodResponse.json()
    const paymentMethodId = methodData.data.id
    console.log("[QR Ph] Step 2 Success - Method ID:", paymentMethodId)

    // Step 3: Attach the Payment Method to Payment Intent
    logToFile("[QR Ph] Step 3: Attaching Payment Method to Intent")
    
    let attachResponse
    let retries = 2
    let lastError = null
    let firstAttachData = null

    // Retry logic for attach step (server errors can be transient)
    while (retries >= 0) {
      try {
        attachResponse = await fetch(
          `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  payment_method: paymentMethodId,
                },
              },
            }),
          }
        )

        if (attachResponse.ok) {
          logToFile("[QR Ph] Step 3 Success - Payment attached")
          break
        }

        const errorData = await attachResponse.json()
        const errorCode = errorData.errors?.[0]?.code
        lastError = errorData

        logToFile("[QR Ph] Step 3 Error", { errorCode, detail: errorData.errors?.[0]?.detail })

        // Don't retry certain errors
        if (errorCode === "parameter_attached_state") {
          logToFile("[QR Ph] Payment method already attached - fetching payment intent for QR code")
          // Payment was already attached - fetch the intent to get QR code
          const intentResponse = await fetch(
            `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`,
            {
              method: "GET",
              headers: { Authorization: authHeader },
            }
          )
          
          if (intentResponse.ok) {
            firstAttachData = await intentResponse.json()
            logToFile("[QR Ph] Payment intent fetched for QR code")
            break
          } else {
            logToFile("[QR Ph] Failed to fetch payment intent")
          }
        }

        // Retry only for transient errors
        if (errorCode === "resource_processing_error" && retries > 0) {
          retries--
          logToFile(`[QR Ph] Transient error, retrying... (${retries} attempts left)`)
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }

        // If not transient error or no retries left
        return NextResponse.json(
          { 
            error: "Failed to attach payment method", 
            details: errorData,
          },
          { status: 500 }
        )
      } catch (err) {
        logToFile("[QR Ph] Step 3 Network error", err)
        if (retries > 0) {
          retries--
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        throw err
      }
    }

    if (!attachResponse?.ok && !firstAttachData) {
      logToFile("[QR Ph] Step 3 - Failed after retries", lastError)
      return NextResponse.json(
        { 
          error: "Failed to attach payment method", 
          details: lastError,
        },
        { status: 500 }
      )
    }

    // Use either the attach response or the fetched intent data
    let attachData = firstAttachData
    if (!attachData && attachResponse?.ok) {
      attachData = await attachResponse.json()
    }
    
    if (!attachData) {
      logToFile("[QR Ph] No valid attach data")
      return NextResponse.json(
        { error: "No valid payment data received" },
        { status: 500 }
      )
    }
    
    logToFile("[QR Ph] Step 3 Success - Payment attached")

    // Extract QR code from response
    const qrCodeUrl = attachData.data.attributes.next_action?.code?.image_url
    if (!qrCodeUrl) {
      console.error("[QR Ph] No QR code URL in response:", attachData)
      return NextResponse.json(
        { error: "No QR code returned from PayMongo" },
        { status: 500 }
      )
    }

    console.log("[QR Ph] QR Code URL received:", qrCodeUrl.substring(0, 50) + "...")

    // Update order with PayMongo payment intent ID and payment method
    await ordersCollection.updateOne(
      { _id: new (require("mongodb")).ObjectId(orderId) },
      {
        $set: {
          paymongoPaymentIntentId: paymentIntentId,
          paymongoPaymentMethodId: paymentMethodId,
          paymentMethod: "qrph",
          updatedAt: new Date(),
        },
      }
    )

    // Return QR code image URL
    return NextResponse.json(
      {
        success: true,
        paymentIntentId: paymentIntentId,
        paymentMethodId: paymentMethodId,
        qrCode: qrCodeUrl,
        amount: amount,
        currency: "PHP",
        paymentMethod: "qrph",
        expiresIn: "30 minutes",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[QR Ph] Payment creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payment", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")

    const url = new URL(request.url)
    const orderId = url.searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      )
    }

    const { ObjectId } = require("mongodb")
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Return comprehensive payment status
    return NextResponse.json(
      {
        paymentStatus: order.paymentStatus || "pending",
        status: order.status || "pending",
        amount: order.totalAmount,
        currency: "PHP",
        paymentMethod: order.paymentMethod || "qrph",
        paymentIntentId: order.paymongoPaymentIntentId,
        failedReason: order.paymentFailedReason,
        failedCode: order.paymentFailedCode,
        expiredAt: order.qrCodeExpiredAt,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Payment check error:", error)
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    )
  }
}
