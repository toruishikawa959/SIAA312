import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Book } from "@/lib/types"

/**
 * DELETE /api/books/[id]
 * Delete a book by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")

    const bookId = params.id

    if (!bookId) {
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 })
    }

    const result = await booksCollection.deleteOne({
      _id: new ObjectId(bookId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: "Book deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting book:", error)
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 })
  }
}
