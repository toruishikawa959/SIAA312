"use client"

import { useEffect, useState } from "react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { DollarSign, Package, BookOpen, Users, AlertCircle, Loader } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatPeso, formatPesoShort } from "@/lib/currency"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const stats = [
    { label: "Total Revenue", value: formatPesoShort(76600), icon: DollarSign, color: "text-coral" },
    { label: "Total Orders", value: "200", icon: Package, color: "text-gold" },
    { label: "Books Sold", value: "180", icon: BookOpen, color: "text-gold" },
    { label: "Active Customers", value: "156", icon: Users, color: "text-coral" },
  ]

  const revenueData = [
    { month: "Dec", revenue: 3591.7 },
    { month: "Jan", revenue: 1840 },
    { month: "Feb", revenue: 1100 },
    { month: "Mar", revenue: 8360 },
    { month: "Apr", revenue: 24560 },
    { month: "May", revenue: 11501 },
  ]

  const topBooks = [
    { title: "The First Bakla", sales: 22, revenue: 9900 },
    { title: "Ambergris Book Launch", sales: 22, revenue: 9900 },
    { title: "PUP Book Launch", sales: 20, revenue: 10000 },
    { title: "MIBF", sales: 43, revenue: 19350 },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "Sarah Johnson", amount: 9900, status: "Completed" },
    { id: "ORD-002", customer: "John Smith", amount: 13500, status: "Shipped" },
    { id: "ORD-003", customer: "Emma Davis", amount: 9900, status: "Processing" },
    { id: "ORD-004", customer: "Michael Brown", amount: 19800, status: "Ready for Pickup" },
  ]

  const lowStockBooks = [
    { title: "The First Bakla", stock: 0 },
    { title: "Heat Index", stock: 0 },
    { title: "Altar ng Pangungulila", stock: 0 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Shipped":
        return "bg-indigo-100 text-indigo-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Ready for Pickup":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <>
        <AdminNavigation userType="admin" />
        <main className="min-h-screen bg-off-white flex items-center justify-center">
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
      <AdminNavigation userType="admin" />

      <main className="min-h-screen bg-off-white">
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
              {/* Revenue Chart */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Revenue Trend</h2>
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

              {/* Top Selling Books */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Top Selling Books</h2>
                <div className="space-y-4">
                  {topBooks.map((book, idx) => (
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
                </div>
              </Card>
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
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
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Low Stock Alerts */}
              <Card className="card-base p-6 border-l-4 border-coral">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} className="text-coral" />
                  <h2 className="font-serif font-bold text-xl">Low Stock Alerts</h2>
                </div>
                <div className="space-y-3">
                  {lowStockBooks.map((book, idx) => (
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
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
