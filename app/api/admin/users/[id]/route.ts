import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"

/**
 * PATCH /api/admin/users/[id]
 * Update user role or suspension status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { role, suspended } = body

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    // Update role if provided
    if (role !== undefined) {
      const validRoles = ["customer", "staff", "admin"]
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        )
      }
      updateData.role = role
    }

    // Update suspension status if provided
    if (suspended !== undefined) {
      if (typeof suspended !== "boolean") {
        return NextResponse.json(
          { error: "Suspended must be a boolean" },
          { status: 400 }
        )
      }
      updateData.suspended = suspended
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User updated",
    })
  } catch (err) {
    console.error("[Admin] Update user error:", err)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const usersCollection = db.collection("users")

    // Delete the user
    const result = await usersCollection.deleteOne(
      { _id: new ObjectId(id) }
    )

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (err) {
    console.error("[Admin] Delete user error:", err)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
