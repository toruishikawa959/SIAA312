"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Package, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { use } from "react"

interface OrderParams {
  id: string
}

export default function OrderDetails({ params }: { params: Promise<OrderParams> }) {
  const { id: orderId } = use(params)

  // Mock order data
  const order = {
    id: orderId,
    date: "2025-01-15",
    status: "Completed",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "+1 (555) 123-4567",
    shippingAddress: "123 Main Street, Portland, OR 97201",
    notes: "Please leave at front door",
    items: [
      {
        id: 1,
        title: "The Art of Listening",
        author: "Sarah Chen",
        quantity: 1,
        price: 18.99,
      },
      {
        id: 2,
        title: "Voices Unheard",
        author: "Marcus Williams",
        quantity: 2,
        price: 14.99,
      },
    ],
    subtotal: 48.97,
    tax: 3.92,
    total: 52.89,
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Processing":
        return "bg-blue-100 text-blue-800"
      case "Ready for Pickup":
        return "bg-purple-100 text-purple-800"
      case "Shipped":
        return "bg-indigo-100 text-indigo-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/orders" className="flex items-center gap-2 text-gold hover:text-yellow-500 mb-8">
              <ChevronLeft size={20} />
              Back to My Orders
            </Link>

            <div className="flex items-center gap-4 mb-8">
              <h1 className="font-serif text-4xl font-bold">{order.id}</h1>
              <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
            </div>

            <p className="text-gray-600 mb-8">
              Order placed on{" "}
              {new Date(order.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items & Shipping */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items */}
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-xl mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start pb-4 border-b border-gray-200 last:border-b-0"
                      >
                        <div>
                          <h3 className="font-serif font-bold">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.author}</p>
                          <p className="text-gray-600 text-sm mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Shipping Information */}
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-xl mb-4">Shipping Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Package size={20} className="text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-semibold">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={20} className="text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{order.customerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{order.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-gold mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Shipping Address</p>
                        <p className="font-semibold">{order.shippingAddress}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Order Notes */}
                {order.notes && (
                  <Card className="card-base p-6">
                    <h2 className="font-serif font-bold text-xl mb-4">Order Notes</h2>
                    <p className="text-gray-700">{order.notes}</p>
                  </Card>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="card-base p-6 sticky top-20">
                  <h2 className="font-serif font-bold text-lg mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>${order.tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="font-serif font-bold text-lg">Total</span>
                    <span className="text-coral font-bold text-lg">${order.total.toFixed(2)}</span>
                  </div>

                  <div className="bg-cream rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <Badge className={`${getStatusColor(order.status)} w-full text-center justify-center`}>
                      {order.status}
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
