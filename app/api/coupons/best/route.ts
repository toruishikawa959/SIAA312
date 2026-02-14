import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { findBestCoupon } from "@/lib/coupon-service"

/**
 * POST /api/coupons/best
 * Finds the best applicable coupon for the given cart
 * 
 * Request body:
 * {
 *   cartTotal: number,
 *   userId?: string,
 *   guestEmail?: string,
 *   cartItems?: Array<{ bookId, title, price, quantity, category }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure MongoDB connection
    await connectToDatabase()

    const body = await request.json()
    const { cartTotal, userId, guestEmail, cartItems } = body

    // Validate input
    if (cartTotal === undefined || typeof cartTotal !== "number" || cartTotal < 0) {
      return NextResponse.json(
        { error: "Valid cart total is required" },
        { status: 400 }
      )
    }

    // Find the best coupon
    const result = await findBestCoupon(cartTotal, userId, guestEmail, cartItems)

    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          message: "No applicable coupons found" 
        },
        { status: 200 }
      )
    }

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
          applicableCategories: result.coupon.applicableCategories,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Best Coupon] Error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to find best coupon" },
      { status: 500 }
    )
  }
}
