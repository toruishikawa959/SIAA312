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
  images?: string[]  // Array of image URLs (1-5+), can be set by staff/admin
  volume?: number  // Volume number (e.g., 1, 2, 3 for series/volumes)
  seriesId?: string  // Reference to series (e.g., "anthology-vol-1")
  relatedVolumes?: string[]  // Array of related book _ids for same series
  createdAt?: Date
  updatedAt?: Date
}

export interface Address {
  _id?: ObjectId
  userId: ObjectId
  label: string // "Home", "Office", "Other"
  fullAddress: string // Complete address text
  phone: string // Required for delivery
  latitude: number // GPS coordinate
  longitude: number // GPS coordinate
  details?: string // Apartment, Suite, etc.
  isDefault?: boolean // Default delivery address
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
  phone?: string
  defaultAddressId?: ObjectId // Reference to default address
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
  guestLatitude?: number // GPS coordinate for precise delivery
  guestLongitude?: number // GPS coordinate for precise delivery
  // Order details
  items: OrderItem[]
  totalAmount: number
  deliveryMethod: "delivery" | "pickup"
  shippingAddress?: string
  shippingLatitude?: number
  shippingLongitude?: number
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
