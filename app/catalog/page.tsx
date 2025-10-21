"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen } from "lucide-react"
import { formatPeso } from "@/lib/currency"

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["Vol. 1", "Vol. 2", "Vol. 3", "Vol. 4"]

  const allBooks = [
    {
      id: 1,
      title: "The First Bakla",
      author: "Mark Dimaisip",
      category: "Vol. 4",
      price: 450,
      stock: 0,
      cover: "/the-first-bakla-book-cover.jpg",
    },
    {
      id: 2,
      title: "Heat Index",
      author: "Genevieve L. Asenjo",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/heat-index-book-cover.jpg",
    },
    {
      id: 3,
      title: "Altar ng Pangungulila",
      author: "Edbert Darwin Casten",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/altar-ng-pangungulila-book-cover.jpg",
    },
    {
      id: 4,
      title: "Lamanglupa Unlimited",
      author: "Edelio De los Santos",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/lamanglupa-unlimited-book-cover.jpg",
    },
    {
      id: 5,
      title: "Other Side",
      author: "Gerome Dela Peña",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/other-side-book-cover.jpg",
    },
    {
      id: 6,
      title: "Kapag Sinabi ko",
      author: "Redwin Dob",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/kapag-sinabi-ko-book-cover.jpg",
    },
    {
      id: 7,
      title: "Lahat Silang Hindi Nahahagip ng Paningin",
      author: "Klara Espedido",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/lahat-silang-hindi-nahahagip-book-cover.jpg",
    },
    {
      id: 8,
      title: "Dilat sa Pusikit",
      author: "Harold Fiesta",
      category: "Vol. 1",
      price: 450,
      stock: 0,
      cover: "/dilat-sa-pusikit-book-cover.jpg",
    },
  ]

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
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="card-base overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      {book.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Out of Stock</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 badge-gold">{book.category}</div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-serif font-bold text-sm mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-xs mb-3">{book.author}</p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-3">
                          <span className="badge-coral">{formatPeso(book.price)}</span>
                        </div>
                        <Button className="btn-primary w-full text-sm py-2" disabled={book.stock === 0}>
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
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
