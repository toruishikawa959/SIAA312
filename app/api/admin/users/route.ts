import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/admin/users
 * List all users with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)
    const role = searchParams.get("role")

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Build filter
    const filter: any = {}
    if (role && role !== "all") filter.role = role

    // Fetch users
    const users = await usersCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await usersCollection.countDocuments(filter)

    // Transform users - remove password field
    const transformedUsers = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        _id: user._id.toString(),
      }
    })

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("[Admin] Users list error:", err)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
