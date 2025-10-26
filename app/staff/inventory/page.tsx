"use client"

import { useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { PageLoader } from "@/components/page-loader"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle } from "lucide-react"

export default function StaffInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [books, setBooks] = useState([
    {
      id: 1,
      title: "The Art of Listening",
      author: "Sarah Chen",
      category: "Essay Collection",
      price: 18.99,
      stock: 12,
      cover: "/placeholder.svg",
    },
    {
      id: 2,
      title: "Voices Unheard",
      author: "Marcus Williams",
      category: "Poetry",
      price: 14.99,
      stock: 2,
      cover: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Community & Change",
      author: "Dr. Elena Rodriguez",
      category: "Non-Fiction",
      price: 22.99,
      stock: 15,
      cover: "/placeholder.svg",
    },
    {
      id: 4,
      title: "Zine Culture Today",
      author: "Alex Thompson",
      category: "Zine",
      price: 12.99,
      stock: 0,
      cover: "/placeholder.svg",
    },
    {
      id: 5,
      title: "Stories of Resilience",
      author: "Various Authors",
      category: "Anthology",
      price: 19.99,
      stock: 20,
      cover: "/placeholder.svg",
    },
    {
      id: 6,
      title: "The Literary Journal",
      author: "Collective",
      category: "Journal",
      price: 16.99,
      stock: 3,
      cover: "/placeholder.svg",
    },
  ])

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStockChange = (id: number, newStock: number) => {
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, stock: Math.max(0, newStock) } : book)))
  }

  return (
    <>
      <StaffSidebar />
      <PageLoader />
      <main className="min-h-screen bg-off-white md:ml-64">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-2">Inventory Management</h1>
            <p className="text-gray-600 mb-8">View and update stock levels</p>

            {/* Search Bar */}
            <div className="mb-8 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full border-2 border-gray-300 focus:border-gold"
              />
            </div>

            {/* Books List */}
            <div className="space-y-4">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="card-base p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Book Info */}
                    <div className="flex-1 flex gap-4">
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="inline-block badge-gold mb-2">{book.category}</div>
                        <h3 className="font-serif font-bold text-lg">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                        <p className="text-coral font-bold">${book.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stock Control */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <label htmlFor={`stock-${book.id}`} className="text-xs text-gray-600 mb-2">
                          Stock
                        </label>
                        <input
                          id={`stock-${book.id}`}
                          type="number"
                          value={book.stock}
                          onChange={(e) => handleStockChange(book.id, Number.parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 font-semibold"
                          min="0"
                        />
                      </div>

                      {/* Low Stock Warning */}
                      {book.stock < 5 && book.stock > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} />
                          Low Stock
                        </div>
                      )}
                      {book.stock === 0 && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} />
                          Out of Stock
                        </div>
                      )}
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
