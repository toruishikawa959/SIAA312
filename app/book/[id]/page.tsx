"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Minus, Plus, Package } from "lucide-react"
import Link from "next/link"

export default function BookDetails({ params }) {
  const bookId = params.id
  const [quantity, setQuantity] = useState(1)

  // Mock book data
  const book = {
    id: bookId,
    title: "The Art of Listening",
    author: "Sarah Chen",
    category: "Essay Collection",
    price: 18.99,
    stock: 12,
    cover: "/placeholder.svg",
    isbn: "978-1234567890",
    publisher: "Sierbosten Press",
    description:
      "A thoughtful exploration of listening in modern society. This collection of essays examines how we listen to each other, to ourselves, and to the world around us. Through personal narratives and philosophical inquiry, Sarah Chen invites readers to reconsider the art of listening as a fundamental human practice.",
  }

  const total = book.price * quantity

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/catalog" className="flex items-center gap-2 text-gold hover:text-yellow-500 mb-8">
              <ChevronLeft size={20} />
              Back to Catalog
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Book Cover */}
              <div>
                <Card className="card-base overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-200">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              </div>

              {/* Book Info */}
              <div>
                <div className="badge-gold mb-4 inline-block">{book.category}</div>

                <h1 className="font-serif text-4xl font-bold mb-2">{book.title}</h1>
                <p className="text-gray-600 text-lg mb-6">{book.author}</p>

                {/* Price Card */}
                <Card className="card-base p-6 mb-6 bg-cream">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Price</span>
                    <span className="text-coral font-bold text-3xl">${book.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-gold" />
                    <span className="text-sm">{book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</span>
                  </div>
                </Card>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="font-serif font-bold text-xl mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>

                {/* Book Details */}
                <div className="mb-8 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISBN</span>
                    <span className="font-semibold">{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publisher</span>
                    <span className="font-semibold">{book.publisher}</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border border-gray-300 p-2 rounded hover:bg-gray-100"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="border border-gray-300 p-2 rounded hover:bg-gray-100"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-8 p-4 bg-cream rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    <span className="text-coral font-bold text-2xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button className="btn-secondary w-full rounded-full py-4 text-lg" disabled={book.stock === 0}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
