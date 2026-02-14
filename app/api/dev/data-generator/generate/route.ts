import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

const bookTitles = [
  "The Silent Echo", "Midnight Chronicles", "Crimson Horizon", "The Last Library",
  "Whispers in the Dark", "The Emerald Key", "Shadows of Tomorrow", "The Glass Cathedral",
  "Beneath the Storm", "The Obsidian Tower", "Tales of the Forgotten", "The Moonlit Path",
  "Echoes of Eternity", "The Silver Compass", "Dreams of the Ancestors", "The Hidden Garden",
  "Voices from Beyond", "The Sapphire Crown", "Rivers of Time", "The Ancient Code",
  "The Eternal Flame", "Secrets of the Sea", "The Broken Mirror", "Dawn of the Phoenix",
  "The Ivory Gate", "Legends of the North", "The Golden Thread", "Winds of Change",
  "The Ruby Ring", "Chronicles of the Lost", "The Marble Palace", "Stars Above",
  "The Copper Bridge", "Tales of Wonder", "The Diamond Heart", "Shadows and Light",
  "The Bronze Door", "Mysteries Unveiled", "The Platinum Crown", "Journey's End",
  "The Stone Circle", "Whispers of Hope", "The Crystal Cave", "Beyond the Horizon",
  "The Iron Throne", "Dreams and Nightmares", "The Velvet Curtain", "Paths Unknown",
  "The Amber Necklace", "Stories of Old", "The Silk Road", "New Beginnings"
]

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"]
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
const cities = ["Manila", "Quezon City", "Makati", "Cebu", "Davao", "Pasig", "Taguig", "Caloocan", "Antipolo", "Parañaque"]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(startYear: number, endYear: number): Date {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { years = 5, orderPatterns = [], newsletterCount = 500, addressCount = 400, appendMode = false } = body

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

    // Clear existing data only if NOT in append mode
    if (!appendMode) {
      await db.collection("orders").deleteMany({})
      await db.collection("newsletter_subscribers").deleteMany({})
      await db.collection("addresses").deleteMany({})
    }

    const currentYear = new Date().getFullYear()
    const orders: any[] = []
    const ordersByYear: { [key: number]: number } = {}

    // Generate orders for each year
    for (let yearOffset = 0; yearOffset < years; yearOffset++) {
      const year = currentYear - years + yearOffset
      const pattern = orderPatterns[yearOffset] || { min: 10, max: 30 }
      
      ordersByYear[year] = 0

      for (let month = 0; month < 12; month++) {
        const ordersThisMonth = randomInt(pattern.min, pattern.max)

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
            createdAt: new Date(year, month, randomInt(1, 28)),
            updatedAt: new Date(year, month, randomInt(1, 28))
          }

          orders.push(order)
          ordersByYear[year]++
        }
      }
    }

    // Insert orders
    if (orders.length > 0) {
      await db.collection("orders").insertMany(orders)
    }

    // Generate newsletter subscribers
    const newsletters: any[] = []
    for (let i = 0; i < newsletterCount; i++) {
      newsletters.push({
        email: `${randomItem(firstNames).toLowerCase()}${randomInt(1, 999)}@example.com`,
        subscribedAt: randomDate(currentYear - years, currentYear)
      })
    }
    if (newsletters.length > 0) {
      await db.collection("newsletter_subscribers").insertMany(newsletters)
    }

    // Generate addresses
    const addresses: any[] = []
    for (let i = 0; i < addressCount; i++) {
      const customer = randomItem(customers)
      addresses.push({
        userId: customer._id,
        name: customer.name,
        phone: `+639${randomInt(100000000, 999999999)}`,
        address: `${randomInt(1, 999)} ${randomItem(["Main", "Oak", "Pine", "Maple", "Cedar"])} St`,
        city: randomItem(cities),
        postalCode: `${randomInt(1000, 9999)}`,
        isDefault: Math.random() > 0.5,
        createdAt: randomDate(currentYear - years, currentYear)
      })
    }
    if (addresses.length > 0) {
      await db.collection("addresses").insertMany(addresses)
    }

    // Build summary
    const summary = {
      orders: orders.length,
      newsletters: newsletters.length,
      addresses: addresses.length,
      ordersByYear
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${orders.length} orders, ${newsletters.length} newsletter subscribers, and ${addresses.length} addresses`,
      summary
    })
  } catch (error) {
    console.error("Error generating data:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate data" },
      { status: 500 }
    )
  }
}
