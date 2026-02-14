"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { AlertCircle, Loader, Truck, Store } from "lucide-react"
import { formatPeso } from "@/lib/currency"

interface OrderItem {
  title: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  guestAddress?: string
  items: OrderItem[]
  totalAmount: number
  status: string
  deliveryMethod: string
  createdAt: string
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/orders")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data.orders || [])
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      setUpdatingOrderId(orderId)
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error("Failed to update order")
      
      // Send status update email to customer
      const order = orders.find(o => o._id === orderId)
      if (order) {
        try {
          await fetch(`/api/admin/orders/${orderId}/send-status-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              status: newStatus,
              email: order.guestEmail,
              name: order.guestName
            }),
          })
        } catch (emailErr) {
          console.error("Failed to send status email:", emailErr)
          // Don't fail the status update if email fails
        }
      }
      
      await fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      // New statuses
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      ready_for_pickup: "bg-purple-100 text-purple-800",
      shipped: "bg-cyan-100 text-cyan-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-emerald-100 text-emerald-800",
      // Old statuses
      confirmed: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getNextStatus = (currentStatus: string, deliveryMethod?: string) => {
    const workflow: Record<string, string> = {
      // New statuses
      pending: "processing",
      processing: deliveryMethod === "pickup" ? "ready_for_pickup" : "shipped",
      ready_for_pickup: "ready_for_pickup",
      shipped: "delivered",
      delivered: "completed",
      completed: "completed",
      // Old statuses (for backwards compatibility with existing orders)
      confirmed: "preparing",
      preparing: deliveryMethod === "pickup" ? "ready_for_pickup" : "shipped",
    }
    return workflow[currentStatus] || null
  }

  const getTrackingTimeline = (status: string, deliveryMethod?: string) => {
    let timeline: Array<{ step: string; label: string }> = []

    if (deliveryMethod === "pickup") {
      timeline = [
        { step: "pending", label: "Placed" },
        { step: "processing", label: "Processing" },
        { step: "ready_for_pickup", label: "Ready for Pickup" },
      ]
    } else {
      timeline = [
        { step: "pending", label: "Placed" },
        { step: "processing", label: "Processing" },
        { step: "shipped", label: "Shipped" },
        { step: "delivered", label: "Delivered" },
        { step: "completed", label: "Completed" },
      ]
    }

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
        <AdminSidebar />
        <main className="min-h-screen bg-off-white md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="text-gold animate-spin" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <AdminSidebar />
        <main className="min-h-screen bg-off-white md:ml-64 py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif font-bold text-4xl mb-6">Manage Orders</h1>

            {error && (
              <Card className="card-base p-4 bg-red-50 border-l-4 border-red-500 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-800">{error}</p>
                </div>
              </Card>
            )}

            {orders.length === 0 ? (
              <Card className="card-base p-8 text-center">
                <p className="text-gray-600">No orders found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card
                    key={order._id}
                    className="card-base p-6 cursor-pointer hover:shadow-lg transition"
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{order.guestName}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.guestEmail}</p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryMethod === "pickup" ? "🏪 Store Pickup" : "🚚 Delivery"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-xl text-gold">{formatPeso(order.totalAmount)}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {expandedOrder === order._id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {/* Order Items */}
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left pb-2">Book Title</th>
                                <th className="text-center pb-2">Qty</th>
                                <th className="text-right pb-2">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="py-2">{item.title}</td>
                                  <td className="text-center">{item.quantity}</td>
                                  <td className="text-right">{formatPeso(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="mb-6 pb-6 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-4">Order Progress</p>
                          <div className="flex justify-between items-center">
                            {getTrackingTimeline(order.status, order.deliveryMethod).map((step, idx) => (
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

                        {/* Delivery Address */}
                        {order.guestAddress && (
                          <div className="mb-6 p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              {order.deliveryMethod === "pickup" ? (
                                <Store size={16} className="text-gold" />
                              ) : (
                                <Truck size={16} className="text-gold" />
                              )}
                              <p className="text-xs text-gray-600 font-semibold">
                                {order.deliveryMethod === "pickup" ? "Pickup Location" : "Delivery Address"}
                              </p>
                            </div>
                            <p className="text-sm">{order.guestAddress}</p>
                          </div>
                        )}

                        {/* Update Status Button */}
                        {getNextStatus(order.status, order.deliveryMethod) && getNextStatus(order.status, order.deliveryMethod) !== order.status && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order._id, getNextStatus(order.status, order.deliveryMethod)!)
                            }}
                            disabled={updatingOrderId === order._id}
                            className="w-full bg-gold text-white hover:bg-gold/90"
                          >
                            {updatingOrderId === order._id ? (
                              <>
                                <Loader size={16} className="animate-spin mr-2" />
                                Updating...
                              </>
                            ) : (
                              `Mark as ${getNextStatus(order.status, order.deliveryMethod)?.replace("_", " ").toUpperCase()}`
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </>
    </ProtectedRoute>
  )
}
