"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, DollarSign, ChevronRight } from "lucide-react"
import Link from "next/link"
import { formatPeso } from "@/lib/currency"

export default function MyOrders() {
  const orders = [
    {
      id: "ORD-001",
      date: "2025-01-15",
      status: "Completed",
      itemCount: 3,
      total: 9900,
      customerName: "Sarah Johnson",
    },
    {
      id: "ORD-002",
      date: "2025-01-10",
      status: "Shipped",
      itemCount: 1,
      total: 4500,
      customerName: "Sarah Johnson",
    },
    {
      id: "ORD-003",
      date: "2025-01-05",
      status: "Ready for Pickup",
      itemCount: 2,
      total: 9900,
      customerName: "Sarah Johnson",
    },
    {
      id: "ORD-004",
      date: "2024-12-28",
      status: "Processing",
      itemCount: 4,
      total: 19800,
      customerName: "Sarah Johnson",
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

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-600 mb-8">Track and manage your book orders</p>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="card-base p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-serif font-bold text-lg">{order.id}</h3>
                          <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={16} />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package size={16} />
                            <span>
                              {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign size={16} />
                            <span>{formatPeso(order.total)}</span>
                          </div>
                          <div className="text-gray-600">
                            <span>{order.customerName}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-2 text-gold hover:text-yellow-500 transition-colors"
                      >
                        <span>View Details</span>
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
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
