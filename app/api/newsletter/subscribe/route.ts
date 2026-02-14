import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { db } = await connectToDatabase()
    const subscribersCollection = db.collection("newsletter_subscribers")

    // Check if email already exists
    const existingSubscriber = await subscribersCollection.findOne({
      email: normalizedEmail,
    })

    if (existingSubscriber) {
      if (existingSubscriber.active === false) {
        // Reactivate subscription
        await subscribersCollection.updateOne(
          { email: normalizedEmail },
          {
            $set: {
              active: true,
              resubscribedAt: new Date(),
              updatedAt: new Date(),
            },
          }
        )
        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        })
      }

      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      )
    }

    // Create new subscriber
    await subscribersCollection.insertOne({
      email: normalizedEmail,
      active: true,
      subscribedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    })
  } catch (err) {
    console.error("[Newsletter] Subscribe error:", err)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    )
  }
}
