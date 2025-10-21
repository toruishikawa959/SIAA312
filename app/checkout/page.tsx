"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function Checkout() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const cartItems = []
  const subtotal = 0
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle order submission
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/cart" className="flex items-center gap-2 text-gold hover:text-yellow-500 mb-8">
              <ChevronLeft size={20} />
              Back to Cart
            </Link>

            <h1 className="font-serif text-4xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <Card className="card-base p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name *</label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone *</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Shipping Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-3 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Order Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-3 font-sans"
                      />
                    </div>

                    <Button type="submit" className="btn-secondary w-full rounded-full py-3">
                      Place Order
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="card-base p-6 sticky top-20">
                  <h2 className="font-serif font-bold text-lg mb-4">Order Summary</h2>

                  {cartItems.length > 0 ? (
                    <>
                      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.title} x{item.quantity}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax (8%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-serif font-bold text-lg">Total</span>
                        <span className="text-coral font-bold text-lg">${total.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">Your cart is empty</p>
                  )}
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
