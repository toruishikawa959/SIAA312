"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Loader } from "lucide-react"
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
  status: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  shippingAddress?: string
}

interface OrderParams {
  id: string
}

export default function OrderDetails({ params }: { params: Promise<OrderParams> }) {
  const { id: orderId } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders?orderId=${orderId}`)
        
        if (!response.ok) {
          throw new Error("Order not found")
        }

        const data = await response.json()
        setOrder(data)
        setError("")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Helper function to get status color
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
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to get tracking timeline
  const getTrackingTimeline = (status: string, deliveryMethod: "delivery" | "pickup") => {
    const statusMap: { [key: string]: string } = {
      pending: "Placed",
      confirmed: "Placed",
      processing: "Processing",
      preparing: "Processing",
      ready_for_pickup: "Ready for Pickup",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
    }

    const displayStatus = statusMap[status.toLowerCase()] || status

    if (deliveryMethod === "pickup") {
      const pickupSteps = ["Placed", "Processing", "Ready for Pickup"]
      return pickupSteps.map((step) => ({
        step,
        completed: pickupSteps.indexOf(step) < pickupSteps.indexOf(displayStatus) || displayStatus === step,
        current: displayStatus === step,
      }))
    } else {
      const deliverySteps = ["Placed", "Processing", "Shipped", "Delivered", "Completed"]
      return deliverySteps.map((step) => ({
        step,
        completed: deliverySteps.indexOf(step) < deliverySteps.indexOf(displayStatus) || displayStatus === step,
        current: displayStatus === step,
      }))
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            </div>
            <Card className="p-8 text-center">
              <p className="text-red-600 font-medium">{error || "Order not found"}</p>
              <Link href="/orders" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Back to Orders
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const customerName = order.userId ? order.guestName || "Customer" : order.guestName || "Guest"
  const customerEmail = order.userId ? order.guestEmail || "" : order.guestEmail || ""
  const timeline = getTrackingTimeline(order.status, order.deliveryMethod)

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600 mt-1">Order #{order._id}</p>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace(/_/g, " ").charAt(0).toUpperCase() + order.status.replace(/_/g, " ").slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Order Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
              <div className="flex items-center justify-between">
                {timeline.map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          item.completed || item.current
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        } ${item.current ? "ring-2 ring-blue-300" : ""}`}
                      >
                        {item.completed && !item.current ? "✓" : index + 1}
                      </div>
                      <p className="text-xs text-center mt-2 font-medium text-gray-700 w-20">
                        {item.step}
                      </p>
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`h-1 w-12 mx-2 ${
                          item.completed ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Method</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-600 text-sm w-24">Name:</span>
                  <span className="text-gray-900 font-medium">{customerName}</span>
                </div>
                {customerEmail && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-sm w-24">Email:</span>
                    <a
                      href={`mailto:${customerEmail}`}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      {customerEmail}
                    </a>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 text-sm w-24">Address:</span>
                    <span className="text-gray-900">{order.shippingAddress}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.author}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPeso(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPeso(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Order Total */}
            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPeso(order.totalAmount * 0.9)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPeso(order.totalAmount * 0.1)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPeso(order.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
