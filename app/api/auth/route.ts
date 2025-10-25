import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/types"
import crypto from "crypto"

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection<User>("users")

    const body = await request.json()
    const { email, password, firstName, lastName, action } = body

    // Sign up action
    if (action === "signup") {
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 }
        )
      }

      const newUser: User = {
        email,
        password: hashPassword(password),
        firstName,
        lastName,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await usersCollection.insertOne(newUser)

      return NextResponse.json(
        {
          user: {
            _id: result.insertedId,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
          },
        },
        { status: 201 }
      )
    }

    // Login action
    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password required" },
          { status: 400 }
        )
      }

      const user = await usersCollection.findOne({ email })

      if (!user || user.password !== hashPassword(password)) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in auth:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const usersCollection = db.collection<User>("users")

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (id) {
      const user = await usersCollection.findOne({
        _id: new ObjectId(id),
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user
      return NextResponse.json(userWithoutPassword, { status: 200 })
    }

    return NextResponse.json(
      { error: "User ID required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
