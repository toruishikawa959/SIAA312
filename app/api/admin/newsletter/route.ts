import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/admin/newsletter
 * Get all newsletter subscribers
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const subscribersCollection = db.collection("newsletter_subscribers")

    const url = new URL(request.url)
    const status = url.searchParams.get("status") // 'active', 'inactive', or 'all'

    let filter: any = {}
    if (status === "active") {
      filter.active = true
    } else if (status === "inactive") {
      filter.active = false
    }
    // if status is 'all' or not provided, no filter applied

    const subscribers = await subscribersCollection
      .find(filter)
      .sort({ subscribedAt: -1 })
      .toArray()

    const stats = {
      total: await subscribersCollection.countDocuments({}),
      active: await subscribersCollection.countDocuments({ active: true }),
      inactive: await subscribersCollection.countDocuments({ active: false }),
    }

    return NextResponse.json({
      subscribers,
      stats,
    })
  } catch (error) {
    console.error("[Admin Newsletter] GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/newsletter
 * Delete a subscriber by email
 */
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const subscribersCollection = db.collection("newsletter_subscribers")

    const result = await subscribersCollection.deleteOne({
      email: email.toLowerCase().trim(),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Subscriber deleted successfully",
    })
  } catch (error) {
    console.error("[Admin Newsletter] DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/newsletter
 * Update subscriber status (activate/deactivate)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { email, active } = await request.json()

    if (!email || typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Email and active status are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const subscribersCollection = db.collection("newsletter_subscribers")

    const result = await subscribersCollection.updateOne(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          active,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Subscriber ${active ? "activated" : "deactivated"} successfully`,
    })
  } catch (error) {
    console.error("[Admin Newsletter] PATCH error:", error)
    return NextResponse.json(
      { error: "Failed to update subscriber" },
      { status: 500 }
    )
  }
}
