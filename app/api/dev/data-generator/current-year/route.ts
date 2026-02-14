import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

const cities = ["Manila", "Quezon City", "Makati", "Cebu", "Davao", "Pasig", "Taguig", "Caloocan", "Antipolo", "Parañaque"]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { year, monthlyOrders, autoAdjustToDate = true, appendMode = false } = body

    const { db } = await connectToDatabase()

    // Fetch existing books and customers
    const books = await db.collection("books").find({}).toArray()
    const customers = await db.collection("users").find({ role: "customer" }).toArray()

    if (books.length === 0 || customers.length === 0) {
      return NextResponse.json(
        { success: false, error: "No books or customers found in database" },
        { status: 400 }
      )
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1 // 1-12
    const currentDay = currentDate.getDate()

    // Delete existing orders for this year only if NOT in append mode
    if (!appendMode) {
      await db.collection("orders").deleteMany({
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59)
        }
      })
    }

    const orders: any[] = []
    let totalOrders = 0

    // Generate orders for each month
    for (let month = 1; month <= 12; month++) {
      // Skip future months if auto-adjust is enabled and it's the current year
      if (autoAdjustToDate && year === currentYear && month > currentMonth) {
        continue
      }

      const pattern = monthlyOrders[month] || { min: 20, max: 35 }
      const ordersThisMonth = randomInt(pattern.min, pattern.max)

      // Determine max day for this month
      let maxDay = new Date(year, month, 0).getDate() // Last day of month

      // If auto-adjust is on, current year, and current month, limit to current day
      if (autoAdjustToDate && year === currentYear && month === currentMonth) {
        maxDay = currentDay
      }

      for (let i = 0; i < ordersThisMonth; i++) {
        const customer = randomItem(customers)
        const numItems = randomInt(1, 3)
        const orderBooks: any[] = []
        let subtotal = 0

        for (let j = 0; j < numItems; j++) {
          const book = randomItem(books)
          const quantity = randomInt(1, 3)
          const price = book.price || parseFloat((Math.random() * 250 + 350).toFixed(2))
          
          orderBooks.push({
            bookId: book._id.toString(),
            title: book.title,
            author: book.author,
            price: parseFloat(price),
            quantity: quantity
          })
          
          subtotal += parseFloat(price) * quantity
        }

        const shippingFee = subtotal > 500 ? 0 : 50
        const discount = 0
        const total = subtotal + shippingFee - discount

        // Random day within allowed range
        const orderDay = randomInt(1, maxDay)
        const orderDate = new Date(year, month - 1, orderDay, randomInt(0, 23), randomInt(0, 59))

        const order = {
          _id: new ObjectId(),
          userId: customer._id,
          guestName: customer.name,
          guestEmail: customer.email,
          guestPhone: customer.phone || `+639${randomInt(100000000, 999999999)}`,
          guestAddress: `${randomInt(1, 999)} ${randomItem(["Main", "Oak", "Pine", "Maple"])} St, ${randomItem(cities)}`,
          items: orderBooks,
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingFee: shippingFee,
          discount: discount,
          totalAmount: parseFloat(total.toFixed(2)),
          status: randomItem(["completed", "delivered"]),
          deliveryMethod: randomItem(["delivery", "pickup"]),
          paymentMethod: randomItem(["card", "gcash", "paymaya", "cod"]),
          createdAt: orderDate,
          updatedAt: orderDate
        }

        orders.push(order)
        totalOrders++
      }
    }

    // Insert orders
    if (orders.length > 0) {
      await db.collection("orders").insertMany(orders)
    }

    const endMonth = autoAdjustToDate && year === currentYear ? currentMonth : 12
    const action = appendMode ? 'Added' : 'Generated'
    const message = `${action} ${totalOrders} orders for ${year} (January to ${new Date(year, endMonth - 1).toLocaleString('default', { month: 'long' })}${autoAdjustToDate && year === currentYear ? ` ${currentDay}` : ''})`

    return NextResponse.json({
      success: true,
      message,
      summary: {
        year,
        totalOrders,
        monthsGenerated: endMonth,
        autoAdjusted: autoAdjustToDate && year === currentYear,
        mode: appendMode ? 'append' : 'replace'
      }
    })
  } catch (error) {
    console.error("Error generating current year data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate current year data" },
      { status: 500 }
    )
  }
}
