import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/db"
import { Address } from "@/lib/types"

export async function GET(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const addressesCollection = db.collection<Address>("addresses")

    const address = await addressesCollection.findOne({
      _id: new ObjectId(params.addressId),
    })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json({ address }, { status: 200 })
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const addressesCollection = db.collection<Address>("addresses")

    const body = await request.json()
    const { label, fullAddress, phone, latitude, longitude, details, isDefault } = body

    const addressId = new ObjectId(params.addressId)
    const currentAddress = await addressesCollection.findOne({ _id: addressId })

    if (!currentAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If marking as default, unset others for this user
    if (isDefault) {
      await addressesCollection.updateMany(
        { userId: currentAddress.userId, _id: { $ne: addressId } },
        { $set: { isDefault: false } }
      )
    }

    const updateData: Partial<Address> = {
      updatedAt: new Date(),
    }

    if (label) updateData.label = label
    if (fullAddress) updateData.fullAddress = fullAddress
    if (phone) updateData.phone = phone
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (details !== undefined) updateData.details = details
    if (isDefault !== undefined) updateData.isDefault = isDefault

    const result = await addressesCollection.findOneAndUpdate(
      { _id: addressId },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
    }

    return NextResponse.json({ address: result }, { status: 200 })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const addressesCollection = db.collection<Address>("addresses")

    const result = await addressesCollection.deleteOne({
      _id: new ObjectId(params.addressId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Address deleted" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
