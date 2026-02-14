import mongoose, { Document, Schema } from "mongoose"

export interface ICouponUsage extends Document {
  couponId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  guestEmail?: string
  orderId: mongoose.Types.ObjectId
  usedAt: Date
}

const CouponUsageSchema = new Schema<ICouponUsage>({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: "Coupon",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  usedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
})

// Compound indexes for efficient querying
CouponUsageSchema.index({ couponId: 1, userId: 1 })
CouponUsageSchema.index({ couponId: 1, guestEmail: 1 })

const CouponUsage =
  mongoose.models.CouponUsage || mongoose.model<ICouponUsage>("CouponUsage", CouponUsageSchema)

export default CouponUsage
