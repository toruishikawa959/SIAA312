"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp, Mail, Phone, MapPin } from "lucide-react"
import { formatPeso } from "@/lib/currency"

export default function StaffOrders() {
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderStatuses, setOrderStatuses] = useState({
    "ORD-001": "Completed",
    "ORD-002": "Shipped",
    "ORD-003": "Ready for Pickup",
    "ORD-004": "Processing",
  })

  const orders = [
    {
      id: "ORD-001",
      date: "2025-01-15",
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      total: 9900,
      items: [
        { title: "The First Bakla", quantity: 1, price: 450 },
        { title: "Heat Index", quantity: 2, price: 450 },
      ],
      address: "123 Main Street, Manila, PH 1000",
      notes: "Please leave at front door",
    },
    {
      id: "ORD-002",
      date: "2025-01-10",
      customer: "John Smith",
      email: "john@example.com",
      phone: "+1 (555) 234-5678",
      total: 13500,
      items: [{ title: "Altar ng Pangungulila", quantity: 3, price: 450 }],
      address: "456 Oak Avenue, Manila, PH 1001",
      notes: "",
    },
    {
      id: "ORD-003",
      date: "2025-01-05",
      customer: "Emma Davis",
      email: "emma@example.com",
      phone: "+1 (555) 345-6789",
      total: 9900,
      items: [{ title: "Lamanglupa Unlimited", quantity: 1, price: 450 }],
      address: "789 Pine Road, Manila, PH 1002",
      notes: "Gift wrapping requested",
    },
    {
      id: "ORD-004",
      date: "2024-12-28",
      customer: "Michael Brown",
      email: "michael@example.com",
      phone: "+1 (555) 456-7890",
      total: 19800,
      items: [
        { title: "Other Side", quantity: 2, price: 450 },
        { title: "Kapag Sinabi Ko", quantity: 1, price: 450 },
      ],
      address: "321 Elm Street, Manila, PH 1003",
      notes: "",
    },
  ]

  const getStatusColor = (status) => {
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

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses((prev) => ({ ...prev, [orderId]: newStatus }))
  }

  return (
    <>
      <AdminNavigation userType="staff" />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-2">Order Management</h1>
            <p className="text-gray-600 mb-8">Process and manage customer orders</p>

            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="card-base overflow-hidden">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-serif font-bold text-lg">{order.id}</h3>
                          <Badge className={`${getStatusColor(orderStatuses[order.id])}`}>
                            {orderStatuses[order.id]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-semibold">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="font-semibold">{order.customer}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-semibold text-xs">{order.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold text-coral">{formatPeso(order.total)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedOrder === order.id ? (
                          <ChevronUp size={24} className="text-gold" />
                        ) : (
                          <ChevronDown size={24} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Items */}
                        <div>
                          <h4 className="font-serif font-bold mb-3">Items</h4>
                          <div className="bg-cream rounded-lg p-4 space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>
                                  {item.title} x{item.quantity}
                                </span>
                                <span className="font-semibold">{formatPeso(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div>
                          <h4 className="font-serif font-bold mb-3">Shipping Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-gold" />
                              <span>{order.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-gold" />
                              <span>{order.phone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                              <span>{order.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Notes */}
                      {order.notes && (
                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Order Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}

                      {/* Status Update */}
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-semibold">Update Status:</label>
                        <Select
                          value={orderStatuses[order.id]}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
