import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * POST /api/dev/coupons/demo
 * Creates a demo coupon with attractive defaults for demonstrations
 */
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Demo coupon configuration
    const demoCoupon = {
      code: "DEMO20",
      discountType: "PERCENTAGE",
      discountAmount: 20,
      minPurchaseAmount: 500,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      isActive: true,
      maxUses: 100,
      applicableCategories: null,
      maxUsesPerUser: null,
      isFirstTimeCustomerOnly: false,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if demo coupon already exists
    const existing = await db.collection("coupons").findOne({ code: "DEMO20" })

    if (existing) {
      // Update the existing demo coupon to ensure it's active and reset usage
      await db.collection("coupons").updateOne(
        { code: "DEMO20" },
        {
          $set: {
            isActive: true,
            expirationDate: demoCoupon.expirationDate,
            usedCount: 0,
            updatedAt: new Date(),
          },
        }
      )

      return NextResponse.json({
        success: true,
        message: "Demo coupon DEMO20 has been reset and is ready to use!",
        coupon: {
          ...demoCoupon,
          _id: existing._id,
          status: "reset",
        },
        usage: {
          code: "DEMO20",
          discount: "20% off",
          minPurchase: "₱500",
          expires: demoCoupon.expirationDate.toLocaleDateString(),
          maxUses: 100,
          currentUses: 0,
        },
      })
    }

    // Create new demo coupon
    const result = await db.collection("coupons").insertOne(demoCoupon)

    return NextResponse.json({
      success: true,
      message: "Demo coupon created successfully!",
      coupon: {
        ...demoCoupon,
        _id: result.insertedId,
      },
      usage: {
        code: "DEMO20",
        discount: "20% off",
        minPurchase: "₱500",
        expires: demoCoupon.expirationDate.toLocaleDateString(),
        maxUses: 100,
        currentUses: 0,
      },
    })
  } catch (error) {
    console.error("[Demo Coupon] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create demo coupon" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/dev/coupons/demo
 * Check if demo coupon exists and get its status
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    const coupon = await db.collection("coupons").findOne({ code: "DEMO20" })

    if (!coupon) {
      return NextResponse.json({
        exists: false,
        message: "Demo coupon does not exist yet. Create it first!",
      })
    }

    const now = new Date()
    const isExpired = coupon.expirationDate < now
    const isActive = coupon.isActive && !isExpired
    const remainingUses = coupon.maxUses ? coupon.maxUses - (coupon.usedCount || 0) : "unlimited"

    return NextResponse.json({
      exists: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        minPurchaseAmount: coupon.minPurchaseAmount,
        expirationDate: coupon.expirationDate,
        isActive: coupon.isActive,
        isExpired,
        usedCount: coupon.usedCount || 0,
        maxUses: coupon.maxUses,
        remainingUses,
      },
      status: isActive ? "active" : isExpired ? "expired" : "inactive",
    })
  } catch (error) {
    console.error("[Demo Coupon] GET Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check demo coupon status" },
      { status: 500 }
    )
  }
}
