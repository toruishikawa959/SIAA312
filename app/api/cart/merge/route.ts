import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import { applyProcessingFee } from "@/lib/pricing"

/**
 * POST /api/cart/merge
 * Merges guest cart items into user's account cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, guestItems } = body

    if (!userId || !guestItems || !Array.isArray(guestItems)) {
      return NextResponse.json(
        { error: "Invalid request: userId and guestItems array required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const cartsCollection = db.collection("carts")
    const booksCollection = db.collection("books")

    const userObjectId = new ObjectId(userId)

    // Get user's existing cart
    const existingCart = await cartsCollection.findOne({ userId: userObjectId })
    const existingItems = existingCart?.items || []

    // Merge guest items into existing cart items
    const mergedItems = [...existingItems]

    for (const guestItem of guestItems) {
      // Verify book exists
      const book = await booksCollection.findOne({
        _id: new ObjectId(guestItem.bookId),
      })

      if (!book) {
        console.warn(`Book not found: ${guestItem.bookId}`)
        continue
      }

      // Find if item exists in merged list
      const existingItem = mergedItems.find(
        (item: any) => item.bookId?.toString() === guestItem.bookId
      )

      if (existingItem) {
        existingItem.quantity += guestItem.quantity
        existingItem.updatedAt = new Date()
      } else {
        mergedItems.push({
          bookId: new ObjectId(guestItem.bookId),
          title: book.title,
          author: book.author,
          price: applyProcessingFee(book.price),
          quantity: guestItem.quantity,
          cover: book.cover,
          addedAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    // Save merged cart
    await cartsCollection.updateOne(
      { userId: userObjectId },
      {
        $set: {
          userId: userObjectId,
          items: mergedItems,
          updatedAt: new Date(),
          ...(existingCart ? {} : { createdAt: new Date() }),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({
      message: "Cart merged successfully",
      itemsMerged: guestItems.length,
      cartItemCount: mergedItems.length,
    })
  } catch (error) {
    console.error("Merge cart error:", error)
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    )
  }
}
