import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Cart, CartItem } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      )
    }

    let cart = await cartsCollection.findOne({
      userId: new ObjectId(userId),
    })

    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart: Cart = {
        userId: new ObjectId(userId),
        items: [],
        updatedAt: new Date(),
      }
      const result = await cartsCollection.insertOne(newCart)
      cart = { _id: result.insertedId, ...newCart }
    }

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    const body = await request.json()
    const { userId, bookId, quantity } = body

    if (!userId || !bookId || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const userObjectId = new ObjectId(userId)
    const bookObjectId = new ObjectId(bookId)

    let cart = await cartsCollection.findOne({ userId: userObjectId })

    if (!cart) {
      // Create new cart
      const newCart: Cart = {
        userId: userObjectId,
        items: [{ bookId: bookObjectId, quantity }],
        updatedAt: new Date(),
      }
      const result = await cartsCollection.insertOne(newCart)
      return NextResponse.json(
        { _id: result.insertedId, ...newCart },
        { status: 201 }
      )
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.bookId.toString() === bookObjectId.toString()
    )

    if (existingItem) {
      // Update quantity
      await cartsCollection.updateOne(
        {
          userId: userObjectId,
          "items.bookId": bookObjectId,
        },
        {
          $inc: { "items.$.quantity": quantity },
          $set: { updatedAt: new Date() },
        }
      )
    } else {
      // Add new item
      await cartsCollection.updateOne(
        { userId: userObjectId },
        {
          $push: { items: { bookId: bookObjectId, quantity } },
          $set: { updatedAt: new Date() },
        }
      )
    }

    cart = await cartsCollection.findOne({ userId: userObjectId })

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    const body = await request.json()
    const { userId, bookId, quantity } = body

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const userObjectId = new ObjectId(userId)
    const bookObjectId = new ObjectId(bookId)

    if (quantity <= 0) {
      // Remove item from cart
      await cartsCollection.updateOne(
        { userId: userObjectId },
        {
          $pull: { items: { bookId: bookObjectId } },
          $set: { updatedAt: new Date() },
        }
      )
    } else {
      // Update quantity
      await cartsCollection.updateOne(
        { userId: userObjectId, "items.bookId": bookObjectId },
        {
          $set: { "items.$.quantity": quantity, updatedAt: new Date() },
        }
      )
    }

    const cart = await cartsCollection.findOne({ userId: userObjectId })

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      )
    }

    await cartsCollection.deleteOne({ userId: new ObjectId(userId) })

    return NextResponse.json({ message: "Cart cleared" }, { status: 200 })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}
