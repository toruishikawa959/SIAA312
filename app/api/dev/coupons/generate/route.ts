import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

function generateCode(prefix: string, length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = prefix
  const remainingLength = length - prefix.length
  
  for (let i = 0; i < remainingLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      count = 10,
      prefix = "SAVE",
      discountType = "percentage",
      discountAmount = 10,
      minPurchase = 500,
      daysValid = 30,
      maxUses = 100,
    } = body

    const { db } = await connectToDatabase()

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysValid)

    const coupons = []
    const codes = []
    const existingCodes = new Set(
      (await db.collection("coupons").find({}, { projection: { code: 1 } }).toArray())
        .map((c: any) => c.code)
    )

    // Generate unique codes
    for (let i = 0; i < count; i++) {
      let code = generateCode(prefix.toUpperCase(), 12)
      let attempts = 0
      
      // Ensure uniqueness
      while (existingCodes.has(code) && attempts < 100) {
        code = generateCode(prefix.toUpperCase(), 12)
        attempts++
      }
      
      if (attempts >= 100) {
        return NextResponse.json(
          { success: false, error: "Unable to generate unique codes. Try a different prefix." },
          { status: 400 }
        )
      }

      existingCodes.add(code)
      codes.push(code)

      coupons.push({
        code,
        discountType,
        discountAmount: Number(discountAmount),
        minPurchaseAmount: Number(minPurchase),
        expirationDate,
        isActive: true,
        maxUses: Number(maxUses),
        applicableCategories: null,
        maxUsesPerUser: 1,
        isFirstTimeCustomerOnly: false,
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // Insert all coupons
    if (coupons.length > 0) {
      await db.collection("coupons").insertMany(coupons)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${coupons.length} coupons successfully!`,
      codes,
      summary: {
        count: coupons.length,
        discountType,
        discountAmount,
        expiresAt: expirationDate.toLocaleDateString(),
      },
    })
  } catch (error) {
    console.error("Error generating coupons:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate coupons" },
      { status: 500 }
    )
  }
}
