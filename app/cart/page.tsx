"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatPeso } from "@/lib/currency"

export default function Cart() {
  const cartItems = [] // Empty cart for now

  const subtotal = 0
  const tax = subtotal * 0.12 // Updated tax to 12% VAT (Philippine standard)
  const total = subtotal + tax

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
                <Link href="/catalog">
                  <Button className="btn-primary">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <Card key={item.id} className="card-base p-4 flex gap-4">
                        <img
                          src={item.cover || "/placeholder.svg"}
                          alt={item.title}
                          className="w-20 h-28 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-serif font-bold">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button className="border border-gray-300 px-2 py-1 rounded">-</button>
                            <span className="px-4">{item.quantity}</span>
                            <button className="border border-gray-300 px-2 py-1 rounded">+</button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPeso(item.price * item.quantity)}</p>
                          <button className="text-coral hover:text-red-600 mt-2">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="card-base p-6 sticky top-20">
                    <h2 className="font-serif font-bold text-lg mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPeso(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>VAT (12%)</span>
                        <span>{formatPeso(tax)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-6">
                      <span className="font-serif font-bold text-lg">Total</span>
                      <span className="text-coral font-bold text-lg">{formatPeso(total)}</span>
                    </div>
                    <Link href="/checkout" className="w-full block mb-3">
                      <Button className="btn-secondary w-full rounded-full">
                        Proceed to Checkout <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </Link>
                    <Link href="/catalog">
                      <Button className="btn-outline w-full rounded-full">Continue Shopping</Button>
                    </Link>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
