import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Book } from "@/lib/types"
import { applyProcessingFee } from "@/lib/pricing"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")

    // Check if specific book ID is requested
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (id) {
      // Get single book by ID
      const book = await booksCollection.findOne({
        _id: new ObjectId(id),
      })

      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 })
      }

      // Ensure active property is set (default to true if not set)
      // Apply 3% processing fee to the price
      const bookWithActive = {
        ...book,
        active: book.active !== false,
        price: applyProcessingFee(book.price),
      }

      return NextResponse.json(bookWithActive, { status: 200 })
    }

    // Get all books with optional filters and limit
    const category = url.searchParams.get("category")
    const activeOnly = url.searchParams.get("activeOnly") === "true" // New parameter for active books only
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "0") || 0, 100) // Max 100
    const filter: any = {}

    if (category) {
      filter.category = category
    }

    // Filter for active books if requested (for public pages like home and catalog)
    if (activeOnly) {
      filter.active = { $ne: false } // Match active: true or undefined
    }

    let query = booksCollection.find(filter)

    if (limit > 0) {
      query = query.limit(limit)
    }

    const books = await query.toArray()

    // Ensure all books have active property (default to true if not set)
    // Apply 3% processing fee to all prices
    const booksWithActive = books.map((book) => ({
      ...book,
      active: book.active !== false, // Treat undefined as true
      price: applyProcessingFee(book.price),
    }))

    return NextResponse.json({ books: booksWithActive }, { status: 200 })
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.author || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: title, author, price" },
        { status: 400 }
      )
    }

    const newBook: Book = {
      title: body.title,
      author: body.author,
      price: body.price,
      description: body.description || "",
      category: body.category || "Uncategorized",
      stock: body.stock || 0,
      image: body.image || "", // Base64 encoded image
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await booksCollection.insertOne(newBook)

    return NextResponse.json(
      { _id: result.insertedId, ...newBook },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection<Book>("books")

    const body = await request.json()

    // Validate required fields
    if (!body._id) {
      return NextResponse.json(
        { error: "Missing required field: _id" },
        { status: 400 }
      )
    }

    const updateData: any = {}

    // Update specific fields if provided
    if (body.title !== undefined) updateData.title = body.title
    if (body.author !== undefined) updateData.author = body.author
    if (body.price !== undefined) updateData.price = body.price
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.image !== undefined) updateData.image = body.image
    if (body.active !== undefined) updateData.active = body.active

    updateData.updatedAt = new Date()

    const result = await booksCollection.updateOne(
      { _id: new ObjectId(body._id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    return NextResponse.json(
      { message: "Book updated successfully", modifiedCount: result.modifiedCount },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 })
  }
}
