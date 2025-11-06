import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/books/categories
 * Fetch all unique book categories
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const booksCollection = db.collection("books")

    // Get distinct categories from all books
    const categories = await booksCollection.distinct("category")

    // Filter out empty/null categories and sort alphabetically
    const validCategories = categories
      .filter((cat) => cat && typeof cat === "string" && cat.trim() !== "")
      .sort((a, b) => a.localeCompare(b))

    return NextResponse.json({ categories: validCategories }, { status: 200 })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
