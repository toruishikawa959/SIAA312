"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Minus, Plus, Package, BookOpen, Loader, ShoppingCart, AlertCircle } from "lucide-react"
import Link from "next/link"
import { addToGuestCart } from "@/lib/guest-cart"
import { useRouter } from "next/navigation"

interface Book {
  _id: string
  title: string
  author: string
  category: string
  price: number
  stock: number
  image?: string
  description: string
  active?: boolean
}

interface BookParams {
  id: string
}

export default function BookDetails({ params }: { params: Promise<BookParams> }) {
  const { id: bookId } = use(params)
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [addedToCart, setAddedToCart] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books?id=${bookId}`)
        if (!response.ok) {
          throw new Error("Book not found")
        }
        const data = await response.json()
        setBook(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load book")
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [bookId])

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-gold" size={32} />
            <p className="text-gray-600 mt-4">Loading book details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Back button skeleton */}
            <div className="h-5 bg-gray-200 rounded w-32 mb-8 animate-pulse"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Book Cover Skeleton */}
              <div>
                <Card className="card-base overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-300 animate-pulse"></div>
                </Card>
              </div>

              {/* Book Info Skeleton */}
              <div>
                <div className="h-5 bg-gray-200 rounded w-16 mb-4 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

                {/* Price Card Skeleton */}
                <Card className="card-base p-6 mb-6 bg-cream space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-8 bg-gray-300 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </Card>

                {/* Description Skeleton */}
                <div className="mb-8 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>

                {/* Quantity and Add to Cart Skeleton */}
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-12 bg-gold rounded w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !book) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-serif text-2xl font-bold mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The book you're looking for doesn't exist."}</p>
            <Link href="/catalog">
              <Button className="btn-secondary">Back to Catalog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
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
              {/* Book Cover with Gallery */}
              <div>
                {/* Main Image */}
                <div className="overflow-hidden cursor-pointer flex flex-col rounded-lg border border-gray-200 mb-4">
                  <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center flex-shrink-0 rounded-lg overflow-hidden relative">
                    {imageError ? (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                        <BookOpen size={48} className="text-gray-400 mb-2" />
                        <span className="text-gray-400 text-sm">Book Cover</span>
                      </div>
                    ) : (
                      <img
                        src={book.image || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </div>
                </div>

                {/* Book Info */}
                <div>
                  <div className="flex gap-2 mb-4 items-center flex-wrap">
                    <div className="badge-gold inline-block">{book.category}</div>
                  </div>

                  <h1 className="font-serif text-4xl font-bold mb-2">{book.title}</h1>
                  <p className="text-gray-600 text-lg mb-6">{book.author}</p>

                  {/* Price Card */}
                  <Card className="card-base p-6 mb-6 bg-cream">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Price</span>
                      <span className="text-coral font-bold text-3xl">₱{book.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={20} className="text-gold" />
                      <span className="text-sm">{book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</span>
                    </div>
                  </Card>

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="font-serif font-bold text-xl mb-3">Description</h2>
                    <p className="text-gray-700 leading-relaxed select-text">{book.description}</p>
                  </div>

                  {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="border border-gray-300 p-2 rounded hover:bg-gray-100"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      type="button"
                      title="Increase quantity"
                      aria-label="Increase quantity"
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
                <div className="space-y-3">
                  <Button
                    onClick={async () => {
                      setIsAdding(true)
                      try {
                        if (!book) return

                        addToGuestCart({
                          bookId: book._id,
                          title: book.title,
                          author: book.author,
                          price: book.price,
                          quantity: quantity,
                          image: book.image,
                        })

                        setAddedToCart(true)
                        setTimeout(() => setAddedToCart(false), 2000)
                      } catch (err) {
                        console.error("Error adding to cart:", err)
                      } finally {
                        setIsAdding(false)
                      }
                    }}
                    className="btn-secondary w-full rounded-full py-4 text-lg flex items-center justify-center gap-2"
                    disabled={book?.stock === 0 || isAdding}
                  >
                    <ShoppingCart size={20} />
                    {isAdding ? "Adding..." : addedToCart ? "Added to Cart!" : "Add to Cart"}
                  </Button>

                  {addedToCart && (
                    <Card className="card-base p-3 bg-green-50 border-l-4 border-green-500">
                      <p className="text-green-800 text-sm font-semibold">✓ Added to cart! View your cart below.</p>
                    </Card>
                  )}

                  <Link href="/cart" className="block">
                    <Button className="btn-outline w-full rounded-full py-3">View Cart</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
