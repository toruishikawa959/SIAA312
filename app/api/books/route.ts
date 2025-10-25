import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Book } from "@/lib/types"

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

      return NextResponse.json(book, { status: 200 })
    }

    // Get all books with optional filters and limit
    const category = url.searchParams.get("category")
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "0") || 0, 100) // Max 100
    const filter: any = {}

    if (category) {
      filter.category = category
    }

    let query = booksCollection.find(filter)

    if (limit > 0) {
      query = query.limit(limit)
    }

    const books = await query.toArray()

    return NextResponse.json({ books }, { status: 200 })
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
    if (!body.title || !body.author || !body.isbn || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: title, author, isbn, price" },
        { status: 400 }
      )
    }

    const newBook: Book = {
      title: body.title,
      author: body.author,
      isbn: body.isbn,
      price: body.price,
      description: body.description || "",
      category: body.category || "Uncategorized",
      stock: body.stock || 0,
      publisher: body.publisher || "",
      publishDate: new Date(body.publishDate) || new Date(),
      imageUrl: body.imageUrl || "",
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
