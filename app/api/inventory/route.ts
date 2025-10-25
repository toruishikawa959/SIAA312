import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Book, InventoryLog } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")

    // Get low stock items
    const lowStockBooks = await booksCollection
      .find({ stock: { $lt: 10 } })
      .toArray()

    return NextResponse.json(lowStockBooks, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")
    const inventoryLogsCollection = db.collection<InventoryLog>("inventoryLogs")

    const body = await request.json()
    const { bookId, quantity, action, reason, staffId } = body

    if (!bookId || !quantity || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const bookObjectId = new ObjectId(bookId)
    const book = await booksCollection.findOne({ _id: bookObjectId })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    let newStock = book.stock

    if (action === "add") {
      newStock += quantity
    } else if (action === "remove") {
      newStock -= quantity
      if (newStock < 0) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        )
      }
    } else if (action === "adjust") {
      newStock = quantity
    }

    // Update book stock
    await booksCollection.updateOne(
      { _id: bookObjectId },
      {
        $set: {
          stock: newStock,
          updatedAt: new Date(),
        },
      }
    )

    // Log the inventory change
    const log: InventoryLog = {
      bookId: bookObjectId,
      action,
      quantity,
      reason: reason || "Manual adjustment",
      staff: staffId ? new ObjectId(staffId) : undefined,
      createdAt: new Date(),
    }

    await inventoryLogsCollection.insertOne(log)

    return NextResponse.json(
      {
        bookId,
        previousStock: book.stock,
        newStock,
        message: "Inventory updated",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 })
  }
}
