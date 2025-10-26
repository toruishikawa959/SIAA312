import { MongoClient, ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id

  try {
    await client.connect()
    const db = client.db("bookstore")
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId)
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't send password hash
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id

  try {
    const body = await req.json()

    await client.connect()
    const db = client.db("bookstore")
    const usersCollection = db.collection("users")

    // Update only allowed fields
    const allowedFields = {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      address: body.address,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      updatedAt: new Date()
    }

    // Remove null values
    Object.keys(allowedFields).forEach(
      key => allowedFields[key as keyof typeof allowedFields] === null && delete allowedFields[key as keyof typeof allowedFields]
    )

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: allowedFields },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't send password hash
    const { password, ...userWithoutPassword } = result

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
