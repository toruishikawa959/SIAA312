"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Heart, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const featuredBooks = [
    {
      id: 1,
      title: "The Art of Listening",
      author: "Sarah Chen",
      category: "Essay Collection",
      price: 18.99,
      cover: "/book-cover-art-listening.jpg",
    },
    {
      id: 2,
      title: "Voices Unheard",
      author: "Marcus Williams",
      category: "Poetry",
      price: 14.99,
      cover: "/book-cover-poetry-voices.jpg",
    },
    {
      id: 3,
      title: "Community & Change",
      author: "Dr. Elena Rodriguez",
      category: "Non-Fiction",
      price: 22.99,
      cover: "/book-cover-community.jpg",
    },
    {
      id: 4,
      title: "Zine Culture Today",
      author: "Alex Thompson",
      category: "Zine",
      price: 12.99,
      cover: "/book-cover-zine.jpg",
    },
    {
      id: 5,
      title: "Stories of Resilience",
      author: "Various Authors",
      category: "Anthology",
      price: 19.99,
      cover: "/book-cover-anthology.jpg",
    },
    {
      id: 6,
      title: "The Literary Journal",
      author: "Collective",
      category: "Journal",
      price: 16.99,
      cover: "/book-cover-journal.jpg",
    },
  ]

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBooks.map((book) => (
                <Card key={book.id} className="card-base overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="badge-gold mb-2 inline-block">{book.category}</div>
                    <h3 className="font-serif font-bold text-lg mb-1">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="badge-coral">${book.price.toFixed(2)}</span>
                      <Link href={`/book/${book.id}`}>
                        <Button className="btn-primary text-sm py-2 px-4">Add to Cart</Button>
                      </Link>
                    </div>
                  </div>
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
