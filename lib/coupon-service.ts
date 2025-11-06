import Coupon, { ICoupon } from "./models/Coupon"

/**
 * Validates a coupon code and calculates the discount amount
 * 
 * @param code - The coupon code to validate (case-insensitive)
 * @param cartTotal - The total cart amount before discount
 * @returns The calculated discount amount
 * @throws Error with specific message if validation fails
 */
export async function validateCoupon(
  code: string,
  cartTotal: number
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
 * Increments the usage count of a coupon (use in payment webhook)
 * 
 * @param code - The coupon code to increment
 * @returns The updated coupon document
 */
export async function incrementCouponUsage(code: string): Promise<ICoupon | null> {
  const normalizedCode = code.trim().toUpperCase()

  const updatedCoupon = await Coupon.findOneAndUpdate(
    { code: normalizedCode },
    { $inc: { usedCount: 1 } },
    { new: true }
  )

  return updatedCoupon
}

/**
 * Checks if a coupon is still valid without calculating discount
 * Useful for real-time validation in the UI
 * 
 * @param code - The coupon code to check
 * @param cartTotal - The total cart amount
 * @returns Boolean indicating if coupon is valid
 */
export async function isCouponValid(code: string, cartTotal: number): Promise<boolean> {
  try {
    await validateCoupon(code, cartTotal)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Gets detailed coupon information for display purposes
 * 
 * @param code - The coupon code
 * @returns Coupon details or null if not found
 */
export async function getCouponDetails(code: string): Promise<ICoupon | null> {
  const normalizedCode = code.trim().toUpperCase()
  return await Coupon.findOne({ code: normalizedCode })
}
