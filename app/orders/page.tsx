"use client"

import { useEffect, useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Package,
  Calendar,
  DollarSign,
  ChevronRight,
  Search,
  Truck,
  Store,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { formatPeso } from "@/lib/currency"

interface OrderItem {
  bookId: string
  title: string
  author: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  userId?: string
  guestEmail?: string
  guestName?: string
  items: OrderItem[]
  totalAmount: number
  deliveryMethod: "delivery" | "pickup"
  status: "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: string
  updatedAt: string
  shippingAddress?: string
}

const STATUS_ORDER = {
  pending: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  completed: 5,
  cancelled: 0,
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch orders from database
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get current user from localStorage
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          setOrders([])
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const response = await fetch(`/api/orders?userId=${user._id}`)

        if (!response.ok) {
          console.error("Failed to fetch orders - Status:", response.status)
          setOrders([])
        } else {
          const data = await response.json()
          // Ensure data is an array and convert _id objects to strings if needed
          const ordersList = Array.isArray(data)
            ? data.map((order: any) => ({
                ...order,
                _id: typeof order._id === "object" ? order._id.$oid || order._id.toString() : order._id,
              }))
            : []
          setOrders(ordersList)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filter and search
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(term) ||
          order.items.some((item) =>
            item.title.toLowerCase().includes(term) ||
            item.author.toLowerCase().includes(term)
          ) ||
          order.shippingAddress?.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [orders, statusFilter, searchTerm])

  // Sort
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders]

    switch (sortBy) {
      case "date-asc":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case "date-desc":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      case "amount-asc":
        return sorted.sort((a, b) => a.totalAmount - b.totalAmount)
      case "amount-desc":
        return sorted.sort((a, b) => b.totalAmount - a.totalAmount)
      default:
        return sorted
    }
  }, [filteredOrders, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock size={16} />
      case "processing":
        return <AlertCircle size={16} />
      case "shipped":
        return <Truck size={16} />
      case "delivered":
      case "completed":
        return <CheckCircle size={16} />
      case "cancelled":
        return <AlertCircle size={16} />
      default:
        return <Package size={16} />
    }
  }

  const getTrackingTimeline = (status: string) => {
    const timeline = [
      { step: "pending", label: "Placed" },
      { step: "processing", label: "Processing" },
      { step: "shipped", label: "Shipped" },
      { step: "delivered", label: "Delivered" },
      { step: "completed", label: "Completed" },
    ]

    const currentIndex = timeline.findIndex((t) => t.step === status.toLowerCase())

    return timeline.map((item, idx) => ({
      ...item,
      completed: currentIndex >= idx,
      current: idx === currentIndex,
    }))
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="mb-8">
                <div className="h-10 bg-gray-200 rounded-lg w-48 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>

              {/* Search and Filters Skeleton */}
              <div className="mb-8 space-y-4">
                <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>

              {/* Order Cards Skeleton */}
              <div className="space-y-4 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="card-base p-6">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
                          <div className="h-6 bg-gray-300 rounded w-24 animate-pulse"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                      </div>

                      <div className="text-right">
                        <div className="h-8 bg-gray-300 rounded w-24 animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="h-5 bg-gray-300 rounded w-32 animate-pulse mb-3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="h-5 bg-gray-300 rounded w-32 animate-pulse mb-3"></div>
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <div key={j} className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Loading message */}
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold"></div>
                  <p className="text-gray-600 font-medium">Fetching your orders...</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-gray-600">
                Track and manage your book orders ({sortedOrders.length} total)
              </p>
            </div>

            {orders.length > 0 ? (
              <>
                {/* Controls */}
                <div className="mb-8 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="text"
                      placeholder="Search by order ID, book title, or address..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters and Sort */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        id="sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                {paginatedOrders.length > 0 ? (
                  <div className="space-y-4 mb-8">
                    {paginatedOrders.map((order) => (
                      <Card
                        key={order._id}
                        className="card-base p-6 hover:shadow-lg transition-shadow"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="font-serif font-bold text-lg">Order {order._id}</h3>
                              <Badge className={`${getStatusColor(order.status)} w-fit flex items-center gap-1`}>
                                {getStatusIcon(order.status)}
                                <span className="capitalize">{order.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-charcoal">
                              {formatPeso(order.totalAmount)}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center justify-end gap-1 mt-1">
                              {order.deliveryMethod === "delivery" ? (
                                <>
                                  <Truck size={14} />
                                  Delivery
                                </>
                              ) : (
                                <>
                                  <Store size={14} />
                                  Pickup
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Order Items Summary */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-gold" />
                            <span className="font-semibold text-gray-700">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex justify-between">
                                <span>
                                  {item.title} × {item.quantity}
                                </span>
                                <span className="font-medium">{formatPeso(item.price * item.quantity)}</span>
                              </li>
                            ))}
                            {order.items.length > 2 && (
                              <li className="text-sm text-gold font-medium">
                                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Order Progress</p>
                          <div className="flex justify-between items-center">
                            {getTrackingTimeline(order.status).map((step, idx) => (
                              <div key={step.step} className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                                    step.completed
                                      ? "bg-green-500 text-white"
                                      : step.current
                                        ? "bg-gold text-white ring-2 ring-gold ring-offset-2"
                                        : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                </div>
                                <p className="text-xs text-gray-600 text-center">{step.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer with Link */}
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Last updated:{" "}
                            {new Date(order.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <Link
                            href={`/orders/${order._id}`}
                            className="flex items-center gap-2 text-gold hover:text-yellow-500 transition-colors font-medium"
                          >
                            <span>View Details</span>
                            <ChevronRight size={20} />
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-4">
                      No orders found matching your search or filters
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setCurrentPage(1)
                      }}
                      className="text-gold hover:text-yellow-500 font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && paginatedOrders.length > 0 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of{" "}
                      {sortedOrders.length} orders
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-gold text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Package size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">You haven't placed any orders yet</p>
                <Link href="/catalog" className="inline-block">
                  <button className="btn-primary">Browse Catalog</button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
