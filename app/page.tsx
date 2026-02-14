"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Heart, Sparkles, ArrowRight, Loader } from "lucide-react"
import Link from "next/link"

interface Book {
  _id: string
  title: string
  author: string
  category: string
  price: number
  description?: string
  image?: string
  active?: boolean
  imageError?: boolean
  totalQuantitySold?: number
  totalRevenue?: number
}

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [bestSellingBooks, setBestSellingBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch featured books
        const featuredResponse = await fetch("/api/books?limit=6&activeOnly=true")
        const featuredData = await featuredResponse.json()
        setFeaturedBooks(featuredData.books || [])

        // Fetch best-selling books
        const salesResponse = await fetch("/api/books/sales?limit=6")
        const salesData = await salesResponse.json()
        setBestSellingBooks(salesData.bestSellers || [])
      } catch (error) {
        console.error("Failed to fetch books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const values = [
    { icon: Users, title: "Inclusive", description: "Welcoming all voices and perspectives" },
    { icon: Heart, title: "Community-Driven", description: "Built by and for our community" },
    { icon: Sparkles, title: "Creative", description: "Celebrating artistic expression" },
  ]

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cream to-gold py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
              Stories That <span className="text-coral">Matter</span>
            </h1>
            <p className="text-lg text-charcoal mb-8 max-w-2xl mx-auto">
              Discover independent literature that challenges, inspires, and connects us. Welcome to the Sierbosten
              Literature Collective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <Button className="btn-secondary w-full sm:w-auto">
                  Browse Catalog <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Button className="btn-outline w-full sm:w-auto">Learn More</Button>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 md:px-8 bg-off-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon
                return (
                  <Card key={idx} className="card-base p-8 text-center">
                    <div className="bg-gold rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Icon size={32} className="text-charcoal" />
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-4xl font-bold mb-12">Featured Books</h2>
            
            {loading ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="card-base overflow-hidden">
                    {/* Book Cover Skeleton */}
                    <div className="aspect-[3/4] bg-gray-300 animate-pulse"></div>
                    {/* Content Skeleton */}
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
                        <div className="h-6 bg-gold rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : featuredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No books available yet.</p>
                <Link href="/catalog">
                  <Button className="btn-secondary">Browse All Books</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {featuredBooks.map((book) => (
                  <Link key={book._id} href={`/book/${book._id}`} className="block">
                    <div className="overflow-visible hover:shadow-xl transition-all duration-300 h-full cursor-pointer flex flex-col rounded-lg border border-gray-200">
                      <div className="aspect-[3/4] bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 rounded-t-lg -m-px">
                        {imageErrors.has(book._id) ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-gray-400">Book Cover</span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={book.image || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => {
                              setImageErrors(prev => new Set([...prev, book._id]))
                            }}
                          />
                        )}
                      </div>
                      <div className="p-1.5 flex flex-col flex-grow min-h-0">
                        <div className="badge-gold mb-0.5 inline-block text-xs mx-auto">{book.category}</div>
                        <h3 className="font-serif font-bold text-xs mb-0.5 line-clamp-2 leading-tight text-center">{book.title}</h3>
                        <p className="text-gray-600 text-xs mb-0.5 line-clamp-1 leading-tight text-center">{book.author}</p>
                        <p className="text-gray-600 text-xs mb-1 line-clamp-2 leading-tight flex-grow text-center">{book.description}</p>
                        <div className="flex items-center justify-center gap-1 mt-auto flex-shrink-0">
                          <span className="badge-coral text-xs px-1 py-0 whitespace-nowrap">₱{book.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Best-Selling Books Section */}
        <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-cream to-gold">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-4xl font-bold mb-12">Best-Selling Books</h2>
            
            {loading ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="card-base overflow-hidden">
                    {/* Book Cover Skeleton */}
                    <div className="aspect-[3/4] bg-gray-300 animate-pulse"></div>
                    {/* Content Skeleton */}
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
                        <div className="h-6 bg-coral rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : bestSellingBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No sales data available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {bestSellingBooks.map((book) => (
                  <Link key={book._id} href={`/book/${book._id}`} className="block">
                    <div className="overflow-visible hover:shadow-xl transition-all duration-300 h-full cursor-pointer flex flex-col rounded-lg border border-gray-200 relative">
                      {/* Sales Badge */}
                      {book.totalQuantitySold !== undefined && book.totalQuantitySold > 0 && (
                        <div className="absolute top-2 right-2 z-10 bg-coral text-white text-xs font-bold px-2 py-1 rounded-full">
                          {book.totalQuantitySold} sold
                        </div>
                      )}
                      
                      <div className="aspect-[3/4] bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 rounded-t-lg -m-px">
                        {imageErrors.has(book._id) ? (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="text-center">
                              <span className="text-gray-400">Book Cover</span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={book.image || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => {
                              setImageErrors(prev => new Set([...prev, book._id]))
                            }}
                          />
                        )}
                      </div>
                      <div className="p-1.5 flex flex-col flex-grow min-h-0">
                        <div className="badge-gold mb-0.5 inline-block text-xs mx-auto">{book.category}</div>
                        <h3 className="font-serif font-bold text-xs mb-0.5 line-clamp-2 leading-tight text-center">{book.title}</h3>
                        <p className="text-gray-600 text-xs mb-0.5 line-clamp-1 leading-tight text-center">{book.author}</p>
                        <p className="text-gray-600 text-xs mb-1 line-clamp-2 leading-tight flex-grow text-center">{book.description}</p>
                        <div className="flex items-center justify-center gap-1 mt-auto flex-shrink-0">
                          <span className="badge-coral text-xs px-1 py-0 whitespace-nowrap">₱{book.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}