"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function OrderSuccess() {
  const order = {
    id: "ORD-001",
    status: "Pending",
    total: 52.97,
    items: [
      { title: "The Art of Listening", quantity: 1, price: 18.99 },
      { title: "Voices Unheard", quantity: 2, price: 14.99 },
    ],
    shippingAddress: "123 Main Street, Portland, OR 97201",
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-gradient-to-b from-cream to-off-white">
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-coral/20 rounded-full blur-2xl"></div>
                <CheckCircle size={120} className="text-coral relative" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="font-serif text-5xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 text-lg mb-12">
              Thank you for your order. We'll process it shortly and send you updates via email.
            </p>

            {/* Order Details Card */}
            <Card className="card-base p-8 mb-8">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <p className="text-sm text-gray-600 mb-2">Order ID</p>
                  <p className="font-serif text-2xl font-bold">{order.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                    <p className="text-coral font-bold text-xl">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-serif font-bold text-lg mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.title} x{item.quantity}
                        </span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-serif font-bold text-lg mb-2">Shipping Address</h3>
                  <p className="text-gray-600">{order.shippingAddress}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="btn-outline w-full sm:w-auto rounded-full">Home</Button>
              </Link>
              <Link href="/catalog">
                <Button className="btn-primary w-full sm:w-auto rounded-full">Browse More</Button>
              </Link>
              <Link href="/orders">
                <Button className="btn-secondary w-full sm:w-auto rounded-full">My Orders</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
