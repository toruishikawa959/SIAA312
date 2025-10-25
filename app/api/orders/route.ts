import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Order, OrderItem, Book } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection<Order>("orders")
    const booksCollection = db.collection<Book>("books")
    const cartsCollection = db.collection("carts")

    const body = await request.json()
    const {
      userId,
      items,
      shippingAddress,
      guestEmail,
      guestName,
      guestPhone,
      guestAddress,
      deliveryMethod,
      total,
    } = body

    // Validate request - either userId or guest details required
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      )
    }

    // Guest order validation
    const isGuestOrder = !userId && guestEmail && guestName && guestPhone
    if (isGuestOrder && !guestAddress) {
      return NextResponse.json(
        { error: "Guest address is required" },
        { status: 400 }
      )
    }

    // User order validation
    if (!isGuestOrder && !userId) {
      return NextResponse.json(
        { error: "User ID or guest details required" },
        { status: 400 }
      )
    }

    let totalAmount = 0
    const orderItems: OrderItem[] = []

    // Validate and calculate total
    for (const item of items) {
      const book = await booksCollection.findOne({
        _id: new ObjectId(item.bookId),
      })

      if (!book) {
        return NextResponse.json(
          { error: `Book ${item.bookId} not found` },
          { status: 404 }
        )
      }

      if (book.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${book.title}` },
          { status: 400 }
        )
      }

      const itemTotal = book.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        bookId: book._id!,
        title: book.title,
        author: book.author,
        quantity: item.quantity,
        price: book.price,
      })

      // Update book stock
      await booksCollection.updateOne(
        { _id: book._id },
        { $inc: { stock: -item.quantity }, $set: { updatedAt: new Date() } }
      )
    }

    // Generate order ID
    const orderId = new ObjectId()

    // Create order - handles both guest and registered user
    const newOrder: any = {
      _id: orderId,
      items: orderItems,
      totalAmount: total || totalAmount,
      status: "pending",
      paymentStatus: "pending",
      deliveryMethod: deliveryMethod || "delivery",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add guest or user details
    if (isGuestOrder) {
      newOrder.guestEmail = guestEmail
      newOrder.guestName = guestName
      newOrder.guestPhone = guestPhone
      newOrder.shippingAddress = guestAddress
    } else {
      newOrder.userId = new ObjectId(userId)
      newOrder.shippingAddress = shippingAddress
    }

    const result = await ordersCollection.insertOne(newOrder)

    // Clear user's cart if registered user
    if (userId) {
      await cartsCollection.deleteOne({ userId: new ObjectId(userId) })
    }

    return NextResponse.json(
      { orderId: result.insertedId.toString(), ...newOrder },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const orderId = url.searchParams.get("orderId")

    if (orderId) {
      // Get specific order
      const order = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      return NextResponse.json(order, { status: 200 })
    }

    if (userId) {
      // Get user's orders
      const orders = await ordersCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()

      return NextResponse.json(orders, { status: 200 })
    }

    // Get all orders (admin only)
    const allOrders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(allOrders, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status required" },
        { status: 400 }
      )
    }

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order updated" }, { status: 200 })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
