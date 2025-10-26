"use client"

import { useEffect, useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { PageLoader } from "@/components/page-loader"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Package, ShoppingCart, AlertCircle, TrendingUp, Loader, Clock, CheckCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { formatPeso } from "@/lib/currency"

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  lowStockItems: number
  totalInventory: number
}

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    totalInventory: 0,
  })
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch orders data
      const ordersRes = await fetch("/api/admin/orders")
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] }

      // Calculate stats from orders
      const orders = ordersData.orders || []
      const totalOrders = orders.length
      const pendingOrders = orders.filter((o: any) => o.status === "pending" || o.status === "confirmed").length
      const completedOrders = orders.filter((o: any) => o.status === "delivered" || o.status === "completed").length
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)

      // Generate mock revenue data for chart
      const mockRevenueData = [
        { date: "Mon", revenue: 2400, orders: 4 },
        { date: "Tue", revenue: 1398, orders: 3 },
        { date: "Wed", revenue: 9800, orders: 8 },
        { date: "Thu", revenue: 3908, orders: 5 },
        { date: "Fri", revenue: 4800, orders: 6 },
        { date: "Sat", revenue: 3800, orders: 4 },
        { date: "Sun", revenue: 4300, orders: 5 },
      ]

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        lowStockItems: 5, // Mock data
        totalInventory: 245, // Mock data
      })
      setRevenueData(mockRevenueData)
      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: stats.totalOrders,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: Clock,
      label: "Pending Orders",
      value: stats.pendingOrders,
      color: "text-coral",
      bgColor: "bg-coral/10",
    },
    {
      icon: CheckCircle,
      label: "Completed Orders",
      value: stats.completedOrders,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: formatPeso(stats.totalRevenue),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  if (loading) {
    return (
      <>
        <StaffSidebar />
        <PageLoader />
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
    <>
      <StaffSidebar />
      <PageLoader />
      <main className="min-h-screen bg-off-white md:ml-64 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold mb-2">Staff Dashboard</h1>
            <p className="text-gray-600">Overview of orders and inventory</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card key={idx} className="card-base p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                      <p className="font-serif font-bold text-3xl">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} ${stat.bgColor} rounded-lg p-3`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <Card className="card-base p-6">
              <h2 className="font-serif font-bold text-xl mb-4">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip formatter={(value: any) => formatPeso(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#F4B73F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Orders Trend */}
            <Card className="card-base p-6">
              <h2 className="font-serif font-bold text-xl mb-4">Orders This Week</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#E85A3C" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="card-base p-6 mb-8">
            <h2 className="font-serif font-bold text-xl mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono">{order._id?.slice(-6) || "N/A"}</td>
                        <td className="py-3 px-4 text-sm">{order.guestName || "Guest"}</td>
                        <td className="py-3 px-4 text-sm font-semibold">{formatPeso(order.totalAmount)}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "delivered" || order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Inventory Alerts */}
          <Card className="card-base p-6 bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Low Stock Alert</h3>
                <p className="text-sm text-yellow-800">
                  {stats.lowStockItems} items are running low on stock. Visit the inventory section to manage stock levels.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
