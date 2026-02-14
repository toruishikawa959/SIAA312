"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { DollarSign, Package, BookOpen, Users, AlertCircle, Loader } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatPeso, formatPesoShort } from "@/lib/currency"

interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: string
}

interface LowStockBook {
  title: string
  stock: number
}

interface TopBook {
  title: string
  sales: number
  revenue: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "₱0", icon: DollarSign, color: "text-coral" },
    { label: "Total Orders", value: "0", icon: Package, color: "text-gold" },
    { label: "Books Sold", value: "0", icon: BookOpen, color: "text-gold" },
    { label: "Active Customers", value: "0", icon: Users, color: "text-coral" },
  ])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [lowStockBooks, setLowStockBooks] = useState<LowStockBook[]>([])
  const [revenueData, setRevenueData] = useState([
    { month: "Dec", revenue: 0 },
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
  ])
  const [last7DaysData, setLast7DaysData] = useState([
    { date: "Day 1", revenue: 0 },
    { date: "Day 2", revenue: 0 },
    { date: "Day 3", revenue: 0 },
    { date: "Day 4", revenue: 0 },
    { date: "Day 5", revenue: 0 },
    { date: "Day 6", revenue: 0 },
    { date: "Day 7", revenue: 0 },
  ])
  const [topBooks, setTopBooks] = useState<TopBook[]>([
    { title: "Loading...", sales: 0, revenue: 0 },
  ])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-cyan-100 text-cyan-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "completed":
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch orders
        const ordersResponse = await fetch("/api/orders")
        const ordersResponseData = ordersResponse.ok ? await ordersResponse.json() : []
        const ordersData = Array.isArray(ordersResponseData) ? ordersResponseData : ordersResponseData.orders || []

        // Fetch books
        const booksResponse = await fetch("/api/books")
        const booksResponseData = booksResponse.ok ? await booksResponse.json() : []
        const booksData = Array.isArray(booksResponseData) ? booksResponseData : booksResponseData.books || []

        // Calculate stats
        const totalOrders = Array.isArray(ordersData) ? ordersData.length : 0
        const totalRevenue = Array.isArray(ordersData)
          ? ordersData.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
          : 0

        const totalBooksSold = Array.isArray(ordersData)
          ? ordersData.reduce((sum: number, order: any) => {
              return sum + (Array.isArray(order.items) ? order.items.length : 0)
            }, 0)
          : 0

        // Get unique customers
        const uniqueCustomers = new Set()
        if (Array.isArray(ordersData)) {
          ordersData.forEach((order: any) => {
            if (order.userId) uniqueCustomers.add(order.userId)
            if (order.guestEmail) uniqueCustomers.add(order.guestEmail)
          })
        }

        // Update stats
        setStats([
          { label: "Total Revenue", value: formatPesoShort(totalRevenue), icon: DollarSign, color: "text-coral" },
          { label: "Total Orders", value: totalOrders.toString(), icon: Package, color: "text-gold" },
          { label: "Books Sold", value: totalBooksSold.toString(), icon: BookOpen, color: "text-gold" },
          { label: "Active Customers", value: uniqueCustomers.size.toString(), icon: Users, color: "text-coral" },
        ])

        // Get recent orders (last 4)
        if (Array.isArray(ordersData)) {
          const recent = ordersData
            .slice(-4)
            .reverse()
            .map((order: any) => ({
              id: order._id?.toString().slice(-6).toUpperCase() || "ORD-?",
              customer: order.guestName || order.userId || "Guest",
              amount: order.totalAmount || 0,
              status: order.status || "pending",
            }))
          setRecentOrders(recent)
        }

        // Get low stock books (stock <= 5)
        if (Array.isArray(booksData)) {
          const lowStock = booksData
            .filter((book: any) => (book.stock || 0) <= 5)
            .slice(0, 3)
            .map((book: any) => ({
              title: book.title || "Unknown",
              stock: book.stock || 0,
            }))
          setLowStockBooks(lowStock)
        }

        // Calculate top books
        const bookSales: { [key: string]: { sales: number; revenue: number; title: string } } = {}
        if (Array.isArray(ordersData)) {
          ordersData.forEach((order: any) => {
            if (Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                if (!bookSales[item.bookId]) {
                  bookSales[item.bookId] = { sales: 0, revenue: 0, title: item.title }
                }
                bookSales[item.bookId].sales += item.quantity || 1
                bookSales[item.bookId].revenue += (item.price || 0) * (item.quantity || 1)
              })
            }
          })
        }

        const topBooksArray = Object.values(bookSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4)

        if (topBooksArray.length > 0) {
          setTopBooks(topBooksArray)
        }

        // Calculate revenue for last 6 months
        const monthlyRevenue = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

          const monthRev = Array.isArray(ordersData)
            ? ordersData
                .filter((order: any) => {
                  const orderDate = new Date(order.createdAt)
                  return orderDate >= monthStart && orderDate <= monthEnd
                })
                .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
            : 0

          monthlyRevenue.push({
            month: date.toLocaleDateString("en-US", { month: "short" }),
            revenue: monthRev,
          })
        }
        setRevenueData(monthlyRevenue)

        // Calculate revenue for last 7 days
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

          const dayRevenue = Array.isArray(ordersData)
            ? ordersData
                .filter((order: any) => {
                  const orderDate = new Date(order.createdAt)
                  return orderDate >= dayStart && orderDate < dayEnd
                })
                .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
            : 0

          last7Days.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            revenue: dayRevenue,
          })
        }
        setLast7DaysData(last7Days)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <main className="min-h-screen bg-off-white md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="text-gold animate-spin" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <AdminSidebar />

        <main className="min-h-screen bg-off-white md:ml-64">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <Card key={idx} className="card-base p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                        <p className="font-serif font-bold text-3xl">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} bg-cream rounded-lg p-3`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart By Month */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Revenue Trend By Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatPeso(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#F4B73F" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Revenue Chart Last 7 Days */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Revenue Trend Last 7 Days</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last7DaysData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => formatPeso(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#F4B73F" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Selling Books */}
            <div className="mb-8">
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Top Selling Books</h2>
                <div className="space-y-4">
                  {topBooks.map((book: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">{book.title}</p>
                        <p className="text-gray-600 text-xs">{book.sales} sales</p>
                      </div>
                      <p className="font-bold text-coral">{formatPeso(book.revenue)}</p>
                    </div>
                  ))}
                  {topBooks.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No sales yet</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-sm">{order.id}</p>
                        <p className="text-gray-600 text-xs">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatPeso(order.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, " ").charAt(0).toUpperCase() + order.status.replace(/_/g, " ").slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>
                  )}
                </div>
              </Card>

              {/* Low Stock Alerts */}
              <Card className="card-base p-6 border-l-4 border-coral">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} className="text-coral" />
                  <h2 className="font-serif font-bold text-xl">Low Stock Alerts</h2>
                </div>
                <div className="space-y-3">
                  {lowStockBooks.map((book: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <p className="text-sm">{book.title}</p>
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-sm ${
                          book.stock === 0 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {book.stock === 0 ? "Out of Stock" : `${book.stock} left`}
                      </span>
                    </div>
                  ))}
                  {lowStockBooks.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">All books well stocked</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      </>
    </ProtectedRoute>
  )
}
