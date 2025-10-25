import { ObjectId } from "mongodb"

export interface Book {
  _id?: ObjectId
  title: string
  author: string
  isbn: string
  price: number
  description: string
  category: string
  stock: number
  publisher: string
  publishDate: Date
  imageUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface User {
  _id?: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  role: "customer" | "staff" | "admin"
  address?: string
  phone?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CartItem {
  bookId: ObjectId
  quantity: number
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt?: Date
}

export interface OrderItem {
  bookId: ObjectId
  title: string
  author: string
  quantity: number
  price: number
}

export interface Order {
  _id?: ObjectId
  userId?: ObjectId
  // Guest order fields
  guestEmail?: string
  guestName?: string
  guestPhone?: string
  guestAddress?: string
  // Order details
  items: OrderItem[]
  totalAmount: number
  deliveryMethod: "delivery" | "pickup"
  shippingAddress?: string
  // Payment & Status
  paymentStatus: "pending" | "paid" | "failed" | "expired"
  paymentMethod?: "qrph" | "card" | "transfer"
  paymongoPaymentIntentId?: string
  paymongoPaymentMethodId?: string
  // Order status workflow
  status: "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "shipped" | "delivered" | "cancelled" | "payment_failed" | "qrcode_expired"
  // Admin tracking
  confirmedAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
  readyForPickupAt?: Date
  confirmedBy?: ObjectId // Staff/Admin who confirmed
  shippedBy?: ObjectId // Staff/Admin who marked as shipped
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface InventoryLog {
  _id?: ObjectId
  bookId: ObjectId
  action: "add" | "remove" | "adjust"
  quantity: number
  reason: string
  staff?: ObjectId
  createdAt?: Date
}
