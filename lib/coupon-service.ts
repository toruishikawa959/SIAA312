import Coupon, { ICoupon } from "../lib/models/Coupon"
import CouponUsage from "../lib/models/CouponUsage"
import mongoose from "mongoose"

interface CartItem {
  bookId: string
  title: string
  price: number
  quantity: number
  category?: string
}

/**
 * Validates a coupon code and calculates the discount amount
 * Enhanced to support category restrictions, per-user limits, and first-time customers
 * 
 * @param code - The coupon code to validate (case-insensitive)
 * @param cartTotal - The total cart amount before discount
 * @param userId - Optional user ID for per-user tracking
 * @param guestEmail - Optional guest email for guest tracking
 * @param cartItems - Optional cart items for category validation
 * @returns The calculated discount amount and coupon details
 * @throws Error with specific message if validation fails
 */
export async function validateCoupon(
  code: string,
  cartTotal: number,
  userId?: string,
  guestEmail?: string,
  cartItems?: CartItem[]
): Promise<{ discount: number; coupon: ICoupon }> {
  // Normalize the code to uppercase for case-insensitive matching
  const normalizedCode = code.trim().toUpperCase()

  // Find the coupon by code
  const coupon = await Coupon.findOne({ code: normalizedCode })

  // Check if coupon exists
  if (!coupon) {
    throw new Error("Invalid coupon code. This coupon does not exist.")
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    throw new Error("This coupon is no longer active.")
  }

  // Check if coupon has expired
  const now = new Date()
  if (coupon.expirationDate < now) {
    throw new Error("This coupon has expired.")
  }

  // Check if cart total meets minimum purchase amount
  if (cartTotal < coupon.minPurchaseAmount) {
    throw new Error(
      `Minimum purchase amount of ₱${coupon.minPurchaseAmount.toFixed(2)} required to use this coupon.`
    )
  }

  // Check if coupon usage limit has been reached
  if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    throw new Error("This coupon has reached its maximum usage limit.")
  }

  // Check per-user usage limit
  if (coupon.maxUsesPerUser && (userId || guestEmail)) {
    const userUsageCount = await CouponUsage.countDocuments({
      couponId: coupon._id,
      ...(userId ? { userId: new mongoose.Types.ObjectId(userId) } : { guestEmail }),
    })

    if (userUsageCount >= coupon.maxUsesPerUser) {
      throw new Error("You have reached the maximum usage limit for this coupon.")
    }
  }

  // Check if first-time customer only
  if (coupon.isFirstTimeCustomerOnly && userId) {
    const Order = mongoose.models.Order
    if (Order) {
      const orderCount = await Order.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
      if (orderCount > 0) {
        throw new Error("This coupon is only available for first-time customers.")
      }
    }
  }

  // Check category restrictions
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0 && cartItems) {
    const hasApplicableItem = cartItems.some(item => 
      coupon.applicableCategories?.includes(item.category || "")
    )
    
    if (!hasApplicableItem) {
      throw new Error(
        `This coupon only applies to: ${coupon.applicableCategories.join(", ")}`
      )
    }
  }

  // Calculate discount amount
  let discount = 0

  if (coupon.discountType === "PERCENTAGE") {
    // Percentage discount (ensure it's capped at 100%)
    const percentage = Math.min(coupon.discountAmount, 100)
    discount = (cartTotal * percentage) / 100
  } else if (coupon.discountType === "FIXED") {
    // Fixed amount discount (cannot exceed cart total)
    discount = Math.min(coupon.discountAmount, cartTotal)
  }

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100

  return {
    discount,
    coupon,
  }
}

/**
 * Increments the usage count of a coupon and records usage (use in payment webhook)
 * 
 * @param code - The coupon code to increment
 * @param orderId - The order ID
 * @param userId - Optional user ID
 * @param guestEmail - Optional guest email
 * @returns The updated coupon document
 */
export async function incrementCouponUsage(
  code: string,
  orderId: string,
  userId?: string,
  guestEmail?: string
): Promise<ICoupon | null> {
  const normalizedCode = code.trim().toUpperCase()

  const coupon = await Coupon.findOne({ code: normalizedCode })
  if (!coupon) return null

  // Record usage in CouponUsage collection
  await CouponUsage.create({
    couponId: coupon._id,
    orderId: new mongoose.Types.ObjectId(orderId),
    ...(userId && { userId: new mongoose.Types.ObjectId(userId) }),
    ...(guestEmail && { guestEmail }),
  })

  // Increment usage count
  const updatedCoupon = await Coupon.findOneAndUpdate(
    { code: normalizedCode },
    { $inc: { usedCount: 1 } },
    { new: true }
  )

  return updatedCoupon
}

/**
 * Finds the best applicable coupon for a cart
 * 
 * @param cartTotal - The total cart amount
 * @param userId - Optional user ID
 * @param guestEmail - Optional guest email
 * @param cartItems - Optional cart items for category validation
 * @returns The best coupon and discount amount, or null if none applicable
 */
export async function findBestCoupon(
  cartTotal: number,
  userId?: string,
  guestEmail?: string,
  cartItems?: CartItem[]
): Promise<{ coupon: ICoupon; discount: number } | null> {
  const now = new Date()
  
  // Find all active, non-expired coupons
  const coupons = await Coupon.find({
    isActive: true,
    expirationDate: { $gte: now },
    minPurchaseAmount: { $lte: cartTotal },
  })

  let bestDiscount = 0
  let bestCoupon: ICoupon | null = null

  for (const coupon of coupons) {
    try {
      const result = await validateCoupon(
        coupon.code,
        cartTotal,
        userId,
        guestEmail,
        cartItems
      )
      
      if (result.discount > bestDiscount) {
        bestDiscount = result.discount
        bestCoupon = result.coupon
      }
    } catch (error) {
      // Skip coupons that don't validate
      continue
    }
  }

  if (bestCoupon) {
    return { coupon: bestCoupon, discount: bestDiscount }
  }

  return null
}

/**
 * Gets coupon expiry information for display
 * 
 * @param expirationDate - The coupon expiration date
 * @returns Status and message about expiry
 */
export function getCouponExpiryInfo(expirationDate: Date): {
  status: "active" | "expiring-soon" | "expired"
  message: string
} {
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { status: "expired", message: "Expired" }
  } else if (daysUntilExpiry === 0) {
    return { status: "expiring-soon", message: "Expires today!" }
  } else if (daysUntilExpiry === 1) {
    return { status: "expiring-soon", message: "Expires tomorrow!" }
  } else if (daysUntilExpiry <= 7) {
    return { status: "expiring-soon", message: `Expires in ${daysUntilExpiry} days` }
  } else {
    return { status: "active", message: `Valid until ${expirationDate.toLocaleDateString()}` }
  }
}
