import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Order, Book } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection<Order>("orders")
    const booksCollection = db.collection<Book>("books")

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "6") || 6, 100)

    // Aggregate sales data from orders
    const salesData = await ordersCollection
      .aggregate([
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.bookId",
            totalQuantitySold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orderCount: { $sum: 1 },
          },
        },
        {
          $sort: { totalQuantitySold: -1 },
        },
        {
          $limit: limit,
        },
      ])
      .toArray()

    // Get book details for best sellers
    const bestSellerIds = salesData.map((item: any) => item._id)
    const bestSellerBooks = await booksCollection
      .find({
        _id: { $in: bestSellerIds },
        active: { $ne: false }, // Only active books
      })
      .toArray()

    // Merge sales data with book details
    const bestSellers = bestSellerIds
      .map((bookId: ObjectId) => {
        const book = bestSellerBooks.find((b) => b._id?.toString() === bookId.toString())
        const sales = salesData.find((s: any) => s._id.toString() === bookId.toString())

        if (!book) return null

        return {
          ...book,
          totalQuantitySold: sales?.totalQuantitySold || 0,
          totalRevenue: sales?.totalRevenue || 0,
          orderCount: sales?.orderCount || 0,
        }
      })
      .filter((item) => item !== null)

    return NextResponse.json({ bestSellers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 })
  }
}

// GET sales statistics for a specific book
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const body = await request.json()
    const { bookId } = body

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    // Get sales data for specific book
    const salesData = await ordersCollection
      .aggregate([
        {
          $unwind: "$items",
        },
        {
          $match: {
            "items.bookId": new ObjectId(bookId),
          },
        },
        {
          $group: {
            _id: "$items.bookId",
            totalQuantitySold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orderCount: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const stats = salesData[0] || { totalQuantitySold: 0, totalRevenue: 0, orderCount: 0 }

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("Error fetching book sales stats:", error)
    return NextResponse.json({ error: "Failed to fetch sales stats" }, { status: 500 })
  }
}
