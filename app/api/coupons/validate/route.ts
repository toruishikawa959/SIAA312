import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { validateCoupon } from "@/lib/coupon-service"
import mongoose from "mongoose"

/**
 * POST /api/coupons/validate
 * Validates a coupon code and returns discount information
 * 
 * Request body:
 * {
 *   code: string,
 *   cartTotal: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure MongoDB connection
    await connectToDatabase()

    const body = await request.json()
    const { code, cartTotal } = body

    // Validate input
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      )
    }

    if (cartTotal === undefined || typeof cartTotal !== "number" || cartTotal < 0) {
      return NextResponse.json(
        { error: "Valid cart total is required" },
        { status: 400 }
      )
    }

    // Validate the coupon
    const result = await validateCoupon(code, cartTotal)

    return NextResponse.json(
      {
        success: true,
        discount: result.discount,
        coupon: {
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountAmount: result.coupon.discountAmount,
          minPurchaseAmount: result.coupon.minPurchaseAmount,
          expirationDate: result.coupon.expirationDate,
          usedCount: result.coupon.usedCount,
          maxUses: result.coupon.maxUses,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Coupon Validation] Error:", error)

    // Return the specific validation error message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
