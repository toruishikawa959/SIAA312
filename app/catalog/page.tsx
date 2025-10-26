"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Loader, Image as ImageIcon } from "lucide-react"
import { formatPeso } from "@/lib/currency"

interface Book {
  _id: string
  title: string
  author: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  cover?: string
  description?: string
  volume?: number
}

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Fetch all books from database
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books")
        const data = await response.json()
        setAllBooks(data.books || [])

        // Extract unique categories
        const uniqueCategories = [...new Set((data.books || []).map((book: Book) => book.category))] as string[]
        setCategories(uniqueCategories.sort())
      } catch (error) {
        console.error("Failed to fetch books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        {/* Page Header */}
        <section className="bg-gradient-to-r from-cream to-gold py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-2">Book Catalog</h1>
            <p className="text-gray-700">Explore our collection of independent literature</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 px-4 md:px-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-2 border-gray-300 focus:border-gold"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Select volume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volumes</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Showing {filteredBooks.length} result{filteredBooks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </section>

        {/* Books Grid */}
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-gold" size={32} />
                <p className="text-gray-600 ml-4">Loading catalog...</p>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredBooks.map((book) => (
                  <Link key={book._id} href={`/book/${book._id}`} className="block">
                    <div className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full cursor-pointer flex flex-col rounded-lg border border-gray-200">
                      <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden flex-shrink-0 rounded-lg flex items-center justify-center">
                        {imageErrors.has(book._id) ? (
                          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                            <ImageIcon size={40} className="text-gray-400 mb-2" />
                            <span className="text-gray-500 text-xs text-center px-2">No Image</span>
                          </div>
                        ) : (
                          <img
                            src={book.imageUrl || book.cover || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setImageErrors(prev => new Set([...prev, book._id]))
                            }}
                          />
                        )}
                        {book.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">Out of Stock</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 badge-gold text-xs">{book.category}</div>
                        {book.volume && (
                          <div className="absolute top-2 left-2 badge-coral text-xs">Vol. {book.volume}</div>
                        )}
                      </div>
                      <div className="p-1.5 flex flex-col flex-grow min-h-0">
                        <h3 className="font-serif font-bold text-xs mb-0.5 line-clamp-2 leading-tight text-center">{book.title}</h3>
                        <p className="text-gray-600 text-xs mb-0.5 line-clamp-1 leading-tight text-center flex-grow">{book.author}</p>
                        <div className="flex items-center justify-center gap-1 mt-auto flex-shrink-0">
                          <span className="badge-coral text-xs px-1 py-0 whitespace-nowrap">₱{book.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No books found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
