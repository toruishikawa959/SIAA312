import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Coupon from "@/lib/models/Coupon"
import mongoose from "mongoose"

/**
 * GET /api/admin/coupons
 * Retrieves all coupons (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive")

    let query: any = {}

    // Filter by active status if specified
    if (isActive !== null) {
      query.isActive = isActive === "true"
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 })

    return NextResponse.json(
      {
        success: true,
        coupons,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Admin Coupons] GET Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/coupons
 * Creates a new coupon (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const {
      code,
      discountType,
      discountAmount,
      minPurchaseAmount,
      expirationDate,
      isActive,
      maxUses,
    } = body

    // Validate required fields
    if (!code || !discountType || discountAmount === undefined || !expirationDate) {
      return NextResponse.json(
        { error: "Missing required fields: code, discountType, discountAmount, expirationDate" },
        { status: 400 }
      )
    }

    // Create new coupon
    const newCoupon = new Coupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountAmount,
      minPurchaseAmount: minPurchaseAmount || 0,
      expirationDate: new Date(expirationDate),
      isActive: isActive !== undefined ? isActive : true,
      maxUses: maxUses || undefined,
      usedCount: 0,
    })

    await newCoupon.save()

    return NextResponse.json(
      {
        success: true,
        message: "Coupon created successfully",
        coupon: newCoupon,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Admin Coupons] POST Error:", error)

    // Handle duplicate code error
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "A coupon with this code already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/coupons
 * Updates a coupon (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      )
    }

    // Don't allow updating code or usedCount directly
    delete updateData.code
    delete updateData.usedCount

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    if (!updatedCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon updated successfully",
        coupon: updatedCoupon,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Admin Coupons] PATCH Error:", error)
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/coupons
 * Deletes a coupon (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      )
    }

    const deletedCoupon = await Coupon.findByIdAndDelete(id)

    if (!deletedCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Coupon deleted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Admin Coupons] DELETE Error:", error)
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    )
  }
}
