"use client"

import { useEffect, useState, useRef } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { PageLoader } from "@/components/page-loader"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { Search, AlertCircle, Loader, Plus, Edit2, X, Upload } from "lucide-react"

interface Book {
  _id: string
  title: string
  author: string
  category: string
  price: number
  stock?: number
  image?: string
  description?: string
  active?: boolean
  series?: string
  volumeNumber?: number
}

interface FormData {
  title: string
  author: string
  category: string
  price: string
  stock: string
  image: string
  description: string
  series: string
  volumeNumber: string
}

interface CropState {
  x: number
  y: number
  scale: number
  dragging: boolean
  startX: number
  startY: number
}

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; message: string; onConfirm: () => void }>({
    show: false,
    message: "",
    onConfirm: () => {},
  })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const styleRef = useRef<HTMLStyleElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
    series: "",
    volumeNumber: "",
  })

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    scale: 1,
    dragging: false,
    startX: 0,
    startY: 0,
  })

  // Update dynamic crop transform styles
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement("style")
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = `
      .crop-image {
        transform: translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.scale}) !important;
      }
    `
  }, [cropState.x, cropState.y, cropState.scale])

  // Handle drag on document level for consistent behavior
  useEffect(() => {
    if (!cropState.dragging) return

    const handleDocumentMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - cropState.startX
      const deltaY = e.clientY - cropState.startY

      setCropState((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
        startX: e.clientX,
        startY: e.clientY,
      }))
    }

    const handleDocumentMouseUp = () => {
      setCropState((prev) => ({ ...prev, dragging: false }))
    }

    document.addEventListener("mousemove", handleDocumentMouseMove)
    document.addEventListener("mouseup", handleDocumentMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleDocumentMouseMove)
      document.removeEventListener("mouseup", handleDocumentMouseUp)
    }
  }, [cropState.dragging, cropState.startX, cropState.startY])

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError("")
      const res = await fetch("/api/books?limit=100")

      if (!res.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await res.json()
      setBooks(data.books || [])
    } catch (err) {
      console.error("Failed to fetch inventory:", err)
      setError("Failed to load inventory. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenAddModal = () => {
    setEditingBook(null)
    setFormData({
      title: "",
      author: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      description: "",
      series: "",
      volumeNumber: "",
    })
    setUploadedImage(null)
    setShowCropper(false)
    setShowModal(true)
  }

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price.toString(),
      stock: (book.stock || 0).toString(),
      image: book.image || "",
      description: book.description || "",
      series: book.series || "",
      volumeNumber: (book.volumeNumber || "").toString(),
    })
    setUploadedImage(book.image || null)
    setShowCropper(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBook(null)
    setFormData({
      title: "",
      author: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      description: "",
      series: "",
      volumeNumber: "",
    })
    setUploadedImage(null)
    setShowCropper(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(event.target?.result as string)
        setShowCropper(true)
        setCropState({ x: 0, y: 0, scale: 1, dragging: false, startX: 0, startY: 0 })
      }
      img.onerror = () => {
        alert("Failed to load image")
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const resizeImage = (imageData: string, maxWidth: number = 500, maxHeight: number = 700): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
        }
        resolve(canvas.toDataURL("image/jpeg", 0.95))
      }
      img.src = imageData
    })
  }

  const cropImage = async () => {
    if (!uploadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const img = new Image()
    img.onload = async () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const containerWidth = 800
      const containerHeight = 1200

      // Scale the image to fit the container while maintaining aspect ratio
      const imgWidth = img.width
      const imgHeight = img.height
      const scale = Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
      const scaledWidth = imgWidth * scale * cropState.scale
      const scaledHeight = imgHeight * scale * cropState.scale

      // Calculate source crop region from the positioned/scaled image
      const sourceX = -cropState.x / (scale * cropState.scale)
      const sourceY = -cropState.y / (scale * cropState.scale)
      const sourceWidth = containerWidth / (scale * cropState.scale)
      const sourceHeight = containerHeight / (scale * cropState.scale)

      canvas.width = 800
      canvas.height = 1200

      // Draw the cropped region from the source image
      ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(sourceWidth, imgWidth - Math.max(0, sourceX)),
        Math.min(sourceHeight, imgHeight - Math.max(0, sourceY)),
        0,
        0,
        800,
        1200
      )

      const croppedImage = canvas.toDataURL("image/png")
      setFormData((prev) => ({ ...prev, image: croppedImage }))
      setShowCropper(false)
    }
    img.src = uploadedImage
  }

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setCropState((prev) => ({
      ...prev,
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
    }))
  }

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cropState.dragging) return

    const deltaX = e.clientX - cropState.startX
    const deltaY = e.clientY - cropState.startY

    setCropState((prev) => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY,
      startX: e.clientX,
      startY: e.clientY,
    }))
  }

  const handleCropMouseUp = () => {
    setCropState((prev) => ({ ...prev, dragging: false }))
  }

  const handleZoom = (direction: "in" | "out") => {
    setCropState((prev) => ({
      ...prev,
      scale: direction === "in" ? Math.min(prev.scale + 0.1, 3) : Math.max(prev.scale - 0.1, 0.5),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title || !formData.author || !formData.category || !formData.price) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)

      if (editingBook) {
        // Update existing book
        const res = await fetch("/api/books", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            _id: editingBook._id,
            title: formData.title,
            author: formData.author,
            category: formData.category,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
            image: formData.image,
            description: formData.description,
            series: formData.series || undefined,
            volumeNumber: formData.volumeNumber ? parseInt(formData.volumeNumber) : undefined,
          }),
        })

        if (!res.ok) throw new Error("Failed to update book")

        // Update local state
        setBooks((prev) =>
          prev.map((book) =>
            book._id === editingBook._id
              ? {
                  ...book,
                  title: formData.title,
                  author: formData.author,
                  category: formData.category,
                  price: parseFloat(formData.price),
                  stock: parseInt(formData.stock) || 0,
                  image: formData.image,
                  description: formData.description,
                  series: formData.series || undefined,
                  volumeNumber: formData.volumeNumber ? parseInt(formData.volumeNumber) : undefined,
                }
              : book
          )
        )
      } else {
        // Create new book
        const res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            category: formData.category,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock) || 0,
            image: formData.image,
            description: formData.description,
            series: formData.series || undefined,
            volumeNumber: formData.volumeNumber ? parseInt(formData.volumeNumber) : undefined,
          }),
        })

        if (!res.ok) throw new Error("Failed to create book")

        const newBook = await res.json()
        setBooks((prev) => [newBook, ...prev])
      }

      handleCloseModal()
    } catch (err) {
      console.error("Failed to save book:", err)
      alert("Failed to save book. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (bookId: string) => {
    setConfirmDialog({
      show: true,
      message: "Are you sure you want to deactivate this book?",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/books", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _id: bookId,
              active: false,
            }),
          })

          if (!res.ok) throw new Error("Failed to deactivate book")

          setBooks((prev) =>
            prev.map((book) =>
              book._id === bookId ? { ...book, active: false } : book
            )
          )
          setConfirmDialog({ show: false, message: "", onConfirm: () => {} })
        } catch (err) {
          console.error("Failed to deactivate book:", err)
          alert("Failed to deactivate book")
        }
      },
    })
  }

  const handleActivate = async (bookId: string) => {
    setConfirmDialog({
      show: true,
      message: "Are you sure you want to activate this book?",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/books", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _id: bookId,
              active: true,
            }),
          })

          if (!res.ok) throw new Error("Failed to activate book")

          setBooks((prev) =>
            prev.map((book) =>
              book._id === bookId ? { ...book, active: true } : book
            )
          )
          setConfirmDialog({ show: false, message: "", onConfirm: () => {} })
        } catch (err) {
          console.error("Failed to activate book:", err)
          alert("Failed to activate book")
        }
      },
    })
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <AdminSidebar />
        <PageLoader />
        <main className="min-h-screen bg-off-white md:ml-64">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-serif text-4xl font-bold mb-2">Inventory Management</h1>
                  <p className="text-gray-600">Manage books and stock levels</p>
                </div>
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-gold hover:bg-yellow-500 text-charcoal font-semibold flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Book
                </Button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader size={48} className="text-gold animate-spin mb-4" />
                  <p className="text-gray-600">Loading inventory...</p>
                </div>
              ) : error ? (
                <Card className="card-base p-6 bg-coral/10 border-2 border-coral">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="text-coral flex-shrink-0" size={24} />
                    <p className="text-coral font-semibold">{error}</p>
                  </div>
                </Card>
              ) : (
                <>
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

                  {filteredBooks.length === 0 ? (
                    <Card className="card-base p-8 text-center">
                      <p className="text-gray-500">
                        {books.length === 0 ? "No books in inventory. Create one to get started!" : "No books found matching your search."}
                      </p>
                    </Card>
                  ) : (
                    /* Books List */
                    <div className="space-y-4">
                      {filteredBooks.map((book) => (
                        <Card
                          key={book._id}
                          className={`card-base p-6 ${
                            !book.active ? "opacity-60 bg-gray-100" : ""
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            {/* Book Info */}
                            <div className="flex-1 flex gap-4">
                              <img
                                src={book.image || "/placeholder.svg"}
                                alt={book.title}
                                className="w-16 h-24 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="inline-block badge-gold">{book.category}</div>
                                  {!book.active && (
                                    <div className="inline-block px-2 py-1 bg-gray-400 text-white text-xs rounded font-semibold">
                                      Inactive
                                    </div>
                                  )}
                                </div>
                                <h3 className="font-serif font-bold text-lg">{book.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                                <div className="flex items-center gap-4">
                                  <p className="text-coral font-bold">₱{book.price.toFixed(2)}</p>
                                  <p className="text-sm text-gray-600">
                                    Stock: <span className="font-semibold">{book.stock || 0}</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 md:gap-3">
                              <Button
                                onClick={() => handleOpenEditModal(book)}
                                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 text-sm"
                              >
                                <Edit2 size={16} />
                                <span className="hidden md:inline">Edit</span>
                              </Button>
                              {book.active ? (
                                <Button
                                  onClick={() => handleDeactivate(book._id)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1 text-sm"
                                >
                                  <AlertCircle size={16} />
                                  <span className="hidden md:inline">Deactivate</span>
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleActivate(book._id)}
                                  className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 text-sm"
                                >
                                  <AlertCircle size={16} />
                                  <span className="hidden md:inline">Activate</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-base w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold">
                    {editingBook ? "Edit Book" : "Add New Book"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-charcoal"
                    title="Close"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title *</label>
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Book title"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Author *</label>
                      <Input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Author name"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Category *</label>
                      <Input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="e.g. Fiction, Poetry"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Price (₱) *</label>
                      <Input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Stock</label>
                      <Input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Series/Volume Name</label>
                      <Input
                        type="text"
                        name="series"
                        value={formData.series}
                        onChange={handleInputChange}
                        placeholder="e.g. Harry Potter, Game of Thrones"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Volume/Book Number</label>
                      <Input
                        type="number"
                        name="volumeNumber"
                        value={formData.volumeNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. 1, 2, 3"
                        min="1"
                        className="w-full border-2 border-gray-300 rounded px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">Book Cover Image</label>
                    
                    {!showCropper ? (
                      <div className="space-y-3">
                        {formData.image && (
                          <div className="flex items-center justify-center">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="h-32 object-contain rounded border-2 border-gold"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            title="Upload book cover image"
                            aria-label="Upload book cover image"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            Choose Image
                          </Button>
                          {formData.image && (
                            <Button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, image: "" }))
                                setUploadedImage(null)
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 border-2 border-gray-300 rounded p-4 bg-gray-50">
                        <div className="text-sm font-semibold mb-2">Crop & Resize Image</div>
                        
                        <div
                          className="crop-container"
                          onMouseDown={handleCropMouseDown}
                        >
                          <img
                            src={uploadedImage || ""}
                            alt="Crop"
                            className="crop-image"
                          />
                          <div className="absolute inset-0 border-4 border-gold pointer-events-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            onClick={() => handleZoom("in")}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                          >
                            Zoom In
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleZoom("out")}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                          >
                            Zoom Out
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setCropState({ x: 0, y: 0, scale: 1, dragging: false, startX: 0, startY: 0 })}
                            className="bg-gray-500 hover:bg-gray-600 text-white text-sm"
                          >
                            Reset
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowCropper(false)}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm"
                          >
                            Cancel
                          </Button>
                        </div>

                        <Button
                          type="button"
                          onClick={cropImage}
                          className="w-full bg-gold hover:bg-yellow-500 text-charcoal font-semibold"
                        >
                          Apply Crop
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Book description"
                      className="w-full border-2 border-gray-300 rounded px-3 py-2 min-h-24 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-300 hover:bg-gray-400 text-charcoal font-semibold"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gold hover:bg-yellow-500 text-charcoal font-semibold flex items-center gap-2"
                      disabled={submitting}
                    >
                      {submitting && <Loader size={16} className="animate-spin" />}
                      {editingBook ? "Update Book" : "Create Book"}
                    </Button>
                  </div>
                </form>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            </Card>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <Card className="card-base w-full max-w-sm">
              <div className="p-6">
                <p className="text-gray-700 font-semibold mb-6 text-center">{confirmDialog.message}</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setConfirmDialog({ show: false, message: "", onConfirm: () => {} })}
                    className="bg-gray-300 hover:bg-gray-400 text-charcoal font-semibold px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDialog.onConfirm}
                    className="bg-coral hover:bg-red-600 text-white font-semibold px-6"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}
