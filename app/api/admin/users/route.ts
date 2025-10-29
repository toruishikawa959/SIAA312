import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { createHash } from "crypto"

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

/**
 * POST /api/admin/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, role } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!["customer", "staff", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = createHash("sha256").update(password).digest("hex")

    // Create new user
    const newUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      suspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    // Return created user (without password)
    return NextResponse.json(
      {
        _id: result.insertedId.toString(),
        firstName,
        lastName,
        email,
        role,
        suspended: false,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[Admin] Create user error:", err)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}
