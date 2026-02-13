import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const users = await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        password: user.password, // Plain text password
        name: user.name,
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
