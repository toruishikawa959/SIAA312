import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing userId or newPassword" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Hash the new password
    const hashedPassword = crypto.createHash("sha256").update(newPassword).digest("hex")

    // Update the user's password
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found or password not changed" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
