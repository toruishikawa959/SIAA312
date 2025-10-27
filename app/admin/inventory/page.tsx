"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { Search, Plus, Edit2, Trash2, AlertCircle, X } from "lucide-react"

interface BookItem {
  id: number
  title: string
  author: string
  category: string
  price: number
  stock: number
  cover: string
  isbn: string
  publisher: string
  description: string
  featured: boolean
}

interface FormDataType {
  title: string
  author: string
  category: string
  price: string
  stock: string
  isbn: string
  publisher: string
  description: string
  featured: boolean
  id?: number
  cover?: string
}

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<BookItem | null>(null)
  const [books, setBooks] = useState<BookItem[]>([
    {
      id: 1,
      title: "The Art of Listening",
      author: "Sarah Chen",
      category: "Essay Collection",
      price: 18.99,
      stock: 12,
      cover: "/placeholder.svg",
      isbn: "978-1234567890",
      publisher: "Sierbosten Press",
      description: "A thoughtful exploration of listening in modern society.",
      featured: true,
    },
    {
      id: 2,
      title: "Voices Unheard",
      author: "Marcus Williams",
      category: "Poetry",
      price: 14.99,
      stock: 2,
      cover: "/placeholder.svg",
      isbn: "978-0987654321",
      publisher: "Independent",
      description: "Poetry collection exploring marginalized voices.",
      featured: false,
    },
    {
      id: 3,
      title: "Community & Change",
      author: "Dr. Elena Rodriguez",
      category: "Non-Fiction",
      price: 22.99,
      stock: 15,
      cover: "/placeholder.svg",
      isbn: "978-1122334455",
      publisher: "Sierbosten Press",
      description: "How communities drive social change.",
      featured: true,
    },
    {
      id: 4,
      title: "Zine Culture Today",
      author: "Alex Thompson",
      category: "Zine",
      price: 12.99,
      stock: 0,
      cover: "/placeholder.svg",
      isbn: "978-5566778899",
      publisher: "DIY Press",
      description: "Contemporary zine culture and DIY publishing.",
      featured: false,
    },
  ])

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    author: "",
    category: "Fiction",
    price: "",
    stock: "",
    isbn: "",
    publisher: "",
    description: "",
    featured: false,
  })

  const categories = ["Fiction", "Non-Fiction", "Poetry", "Zine", "Journal", "Anthology", "Essay Collection"]

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleOpenModal = (book?: BookItem): void => {
    if (book) {
      setEditingBook(book)
      setFormData({
        title: book.title,
        author: book.author,
        category: book.category,
        price: book.price.toString(),
        stock: book.stock.toString(),
        isbn: book.isbn,
        publisher: book.publisher,
        description: book.description,
        featured: book.featured,
        id: book.id,
        cover: book.cover,
      })
    } else {
      setEditingBook(null)
      setFormData({
        title: "",
        author: "",
        category: "Fiction",
        price: "",
        stock: "",
        isbn: "",
        publisher: "",
        description: "",
        featured: false,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingBook(null)
  }

  const handleSaveBook = (): void => {
    if (editingBook) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === editingBook.id
            ? {
                ...book,
                title: formData.title,
                author: formData.author,
                category: formData.category,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                isbn: formData.isbn,
                publisher: formData.publisher,
                description: formData.description,
                featured: formData.featured,
              }
            : book
        )
      )
    } else {
      setBooks((prev) => [
        ...prev,
        {
          id: Math.max(...prev.map((b) => b.id), 0) + 1,
          title: formData.title,
          author: formData.author,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          isbn: formData.isbn,
          publisher: formData.publisher,
          description: formData.description,
          featured: formData.featured,
          cover: "/placeholder.svg",
        },
      ])
    }
    handleCloseModal()
  }

  const handleDeleteBook = (id: number): void => {
    if (confirm("Are you sure you want to delete this book?")) {
      setBooks((prev) => prev.filter((book) => book.id !== id))
    }
  }

  const handleStockChange = (id: number, newStock: number): void => {
    setBooks((prev) => prev.map((book) => (book.id === id ? { ...book, stock: Math.max(0, newStock) } : book)))
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <AdminNavigation userType="admin" />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-4xl font-bold mb-2">Inventory Management</h1>
                <p className="text-gray-600">View and update stock levels</p>
              </div>
              <Button onClick={() => handleOpenModal()} className="btn-secondary rounded-full">
                <Plus size={20} className="mr-2" />
                Add New Book
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-2 border-gray-300 focus:border-gold"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-full border-2 border-gray-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Books Grid */}
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
                        <div className="flex items-center gap-2 mb-2">
                          <div className="badge-gold">{book.category}</div>
                          {book.featured && <div className="badge-coral">Featured</div>}
                        </div>
                        <h3 className="font-serif font-bold text-lg">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                        <p className="text-coral font-bold">${book.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stock & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <label className="text-xs text-gray-600 mb-2">Stock</label>
                        <input
                          type="number"
                          value={book.stock}
                          onChange={(e) => handleStockChange(book.id, Number.parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1 font-semibold"
                          min="0"
                          title="Update stock quantity"
                          placeholder="0"
                        />
                      </div>

                      {/* Stock Status */}
                      {book.stock < 5 && book.stock > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} />
                          Low
                        </div>
                      )}
                      {book.stock === 0 && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} />
                          Out
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(book)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit book"
                          aria-label="Edit book"
                        >
                          <Edit2 size={20} className="text-gold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete book"
                          aria-label="Delete book"
                        >
                          <Trash2 size={20} className="text-coral" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="card-base w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold">{editingBook ? "Edit Book" : "Add New Book"}</h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Book title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Author *</label>
                    <Input
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Price *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ISBN</label>
                    <Input
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="ISBN"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Publisher</label>
                  <Input
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Publisher name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Book description"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 font-sans"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold">
                    Featured Book
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={handleSaveBook} className="btn-secondary flex-1 rounded-full">
                  {editingBook ? "Update Book" : "Add Book"}
                </Button>
                <Button onClick={handleCloseModal} className="btn-outline flex-1 rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
      </>
    </ProtectedRoute>
  )
}
