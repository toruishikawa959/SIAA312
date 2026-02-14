import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Address } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const addressesCollection = db.collection<Address>("addresses")

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      )
    }

    const addresses = await addressesCollection
      .find({ userId: new ObjectId(userId) })
      .toArray()

    return NextResponse.json({ addresses }, { status: 200 })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const addressesCollection = db.collection<Address>("addresses")

    const body = await request.json()
    const { userId, label, fullAddress, phone, latitude, longitude, details, isDefault } = body

    if (!userId || !label || !fullAddress || !phone || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If marking as default, unset others
    if (isDefault) {
      await addressesCollection.updateMany(
        { userId: new ObjectId(userId) },
        { $set: { isDefault: false } }
      )
    }

    const newAddress: Address = {
      userId: new ObjectId(userId),
      label,
      fullAddress,
      phone,
      latitude,
      longitude,
      details,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await addressesCollection.insertOne(newAddress)

    return NextResponse.json(
      {
        address: {
          _id: result.insertedId,
          ...newAddress,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}
