import mongoose, { Document, Schema } from "mongoose"

export interface ICoupon extends Document {
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountAmount: number
  minPurchaseAmount: number
  expirationDate: Date
  isActive: boolean
  maxUses?: number
  usedCount: number
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: {
        values: ["PERCENTAGE", "FIXED"],
        message: "{VALUE} is not a valid discount type. Use PERCENTAGE or FIXED.",
      },
      required: [true, "Discount type is required"],
    },
    discountAmount: {
      type: Number,
      required: [true, "Discount amount is required"],
      min: [0, "Discount amount cannot be negative"],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum purchase amount cannot be negative"],
    },
    expirationDate: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      min: [1, "Maximum uses must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Maximum uses must be an integer",
      },
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient querying
CouponSchema.index({ code: 1, isActive: 1 })
CouponSchema.index({ expirationDate: 1 })

// Prevent model recompilation in development
const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema)

export default Coupon
