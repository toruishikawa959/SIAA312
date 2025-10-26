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
  cover?: string
  imageError?: boolean
}

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const response = await fetch("/api/books?limit=6")
        const data = await response.json()
        setFeaturedBooks(data.books || [])
      } catch (error) {
        console.error("Failed to fetch featured books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedBooks()
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
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-gold" size={32} />
                <span className="ml-3 text-gray-600">Loading featured books...</span>
              </div>
            ) : featuredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No books available yet.</p>
                <Link href="/catalog">
                  <Button className="btn-secondary">Browse All Books</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredBooks.map((book) => (
                  <Card key={book._id} className="card-base overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[3/4] bg-gray-200 overflow-hidden flex items-center justify-center">
                      {imageErrors.has(book._id) ? (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-gray-400">Book Cover</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={book.cover || "/placeholder.svg"}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrors(prev => new Set([...prev, book._id]))
                          }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="badge-gold mb-2 inline-block">{book.category}</div>
                      <h3 className="font-serif font-bold text-lg mb-1">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{book.author}</p>
                      <div className="flex items-center justify-between">
                        <span className="badge-coral">${book.price.toFixed(2)}</span>
                        <Link href={`/book/${book._id}`}>
                          <Button className="btn-primary text-sm py-2 px-4">Add to Cart</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
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