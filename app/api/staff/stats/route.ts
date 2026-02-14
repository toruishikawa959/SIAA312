import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"

/**
 * GET /api/staff/stats
 * Get dashboard statistics:
 * - Total orders count
 * - Pending/Confirmed orders count
 * - Completed/Delivered orders count
 * - Total revenue
 * - Low stock items count
 * - Recent orders (last 5)
 * - Daily revenue data (last 7 days)
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const ordersCollection = db.collection("orders")
    const booksCollection = db.collection("books")

    // Get all orders
    const allOrders = await ordersCollection.find({}).toArray()
    const totalOrders = allOrders.length

    // Count pending/confirmed orders
    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length

    // Count completed/delivered orders
    const completedOrders = allOrders.filter(
      (o) => o.status === "delivered" || o.status === "completed"
    ).length

    // Calculate total revenue
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.totalAmount || 0)
    }, 0)

    // Get low stock items (stock < 5)
    const lowStockItems = await booksCollection
      .countDocuments({
        $expr: { $lt: [{ $ifNull: ["$stock", 0] }, 5] },
      })

    // Get total inventory count
    const totalInventory = await booksCollection.countDocuments({})

    // Get recent orders (last 5)
    const recentOrders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Calculate daily revenue for last 7 days
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const dailyRevenueMap = new Map<string, { revenue: number; orders: number }>()

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", {
        weekday: "short",
      })
      dailyRevenueMap.set(dateStr, { revenue: 0, orders: 0 })
    }

    // Aggregate orders by day
    allOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      if (orderDate >= sevenDaysAgo && orderDate <= today) {
        const dateStr = orderDate.toLocaleDateString("en-US", {
          weekday: "short",
        })
        const current = dailyRevenueMap.get(dateStr) || { revenue: 0, orders: 0 }
        current.revenue += order.totalAmount || 0
        current.orders += 1
        dailyRevenueMap.set(dateStr, current)
      }
    })

    // Convert to array format
    const revenueData = Array.from(dailyRevenueMap.entries()).map(
      ([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      })
    )

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        lowStockItems,
        totalInventory,
      },
      recentOrders: recentOrders.map((order) => ({
        _id: order._id?.toString() || "",
        guestName: order.guestName || "Guest",
        totalAmount: order.totalAmount || 0,
        status: order.status || "pending",
        createdAt: order.createdAt || new Date(),
        itemCount: order.items?.length || 0,
      })),
      revenueData,
    })
  } catch (err) {
    console.error("[Staff] Stats error:", err)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
