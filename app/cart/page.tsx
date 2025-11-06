"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingBag, Trash2, ArrowRight, AlertCircle, LogIn } from "lucide-react"
import Link from "next/link"
import { formatPeso } from "@/lib/currency"
import {
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  clearGuestCart,
  GuestCartItem,
} from "@/lib/guest-cart"

export default function Cart() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({})
  const [checkoutError, setCheckoutError] = useState<string>("")

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId")
    setIsLoggedIn(!!userId)

    // Load guest cart
    const guestItems = getGuestCart()
    setCartItems(guestItems)
    setLoading(false)
  }, [])

  const handleRemove = (bookId: string) => {
    removeFromGuestCart(bookId)
    setCartItems(cartItems.filter(item => item.bookId !== bookId))
    // Clear any stock errors for this item
    setStockErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[bookId]
      return newErrors
    })
  }

  const handleQuantityChange = async (bookId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(bookId)
      return
    }

    // Clear previous error for this item
    setStockErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[bookId]
      return newErrors
    })

    try {
      // Fetch current stock from database
      const response = await fetch(`/api/books?id=${bookId}`)
      
      if (!response.ok) {
        setStockErrors(prev => ({
          ...prev,
          [bookId]: "Failed to check stock availability"
        }))
        return
      }

      const book = await response.json()

      // Validate against available stock
      if (newQuantity > book.stock) {
        setStockErrors(prev => ({
          ...prev,
          [bookId]: `Only ${book.stock} item${book.stock !== 1 ? 's' : ''} available in stock`
        }))
        return
      }

      // Stock is available, proceed with update
      updateGuestCartQuantity(bookId, newQuantity)
      setCartItems(
        cartItems.map(item =>
          item.bookId === bookId ? { ...item, quantity: newQuantity } : item
        )
      )
    } catch (error) {
      console.error("Error checking stock:", error)
      setStockErrors(prev => ({
        ...prev,
        [bookId]: "Error validating stock. Please try again."
      }))
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError("")

    // Validate all items against current stock before checkout
    try {
      const validationErrors: Record<string, string> = {}
      const stockCheckPromises = cartItems.map(async (item) => {
        try {
          const response = await fetch(`/api/books?id=${item.bookId}`)
          if (!response.ok) {
            validationErrors[item.bookId] = "Failed to verify stock"
            return
          }
          const book = await response.json()
          
          if (item.quantity > book.stock) {
            validationErrors[item.bookId] = `Only ${book.stock} available (you have ${item.quantity} in cart)`
          }
        } catch (error) {
          validationErrors[item.bookId] = "Error verifying stock"
        }
      })

      await Promise.all(stockCheckPromises)

      // If there are any validation errors, show them and prevent checkout
      if (Object.keys(validationErrors).length > 0) {
        setStockErrors(validationErrors)
        setCheckoutError("Please fix stock availability issues before proceeding to checkout.")
        setCheckoutLoading(false)
        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      // All items validated, proceed with checkout
      if (!isLoggedIn) {
        await router.push("/login")
      } else {
        await router.push("/checkout")
      }
    } catch (error) {
      console.error("Checkout validation error:", error)
      setCheckoutError("An error occurred while validating your cart. Please try again.")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Skeleton */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Alert Box Skeleton */}
                  <Card className="card-base p-4 h-24 bg-gray-100 animate-pulse"></Card>

                  {/* Cart Items */}
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="card-base p-4 flex gap-4">
                      <div className="w-20 h-28 bg-gray-300 rounded animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="flex gap-2 pt-2">
                          <div className="h-8 bg-gray-300 rounded w-20 animate-pulse"></div>
                          <div className="h-8 bg-gray-300 rounded w-8 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded w-12 animate-pulse"></div>
                    </Card>
                  ))}
                </div>

                {/* Summary Skeleton */}
                <Card className="card-base p-6 h-fit space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-24 animate-pulse mb-4"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="h-8 bg-gold rounded w-full animate-pulse"></div>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
                <Link href="/catalog">
                  <Button className="btn-primary">Browse Catalog</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {checkoutError && (
                    <Card className="card-base p-4 bg-red-50 border-l-4 border-red-500">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-900 mb-1">Checkout Error</h3>
                          <p className="text-red-800 text-sm">{checkoutError}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {!isLoggedIn && (
                    <Card className="card-base p-4 bg-blue-50 border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900 mb-1">Guest Checkout</h3>
                          <p className="text-blue-800 text-sm mb-3">
                            Sign in to merge your cart with your account. Your items will be saved!
                          </p>
                          <div className="flex gap-2">
                            <Link href="/login">
                              <Button className="btn-secondary text-sm py-2 px-4">
                                <LogIn size={16} className="mr-2" /> Sign In
                              </Button>
                            </Link>
                            <Link href="/signup">
                              <Button className="btn-outline text-sm py-2 px-4">Create Account</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {cartItems.map((item) => (
                    <Card key={item.bookId} className="card-base p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <ShoppingBag size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif font-bold">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.author}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.bookId, item.quantity - 1)}
                              className="border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
                              title="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-4 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.bookId, item.quantity + 1)}
                              className="border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-between">
                          <p className="font-bold">{formatPeso(item.price * item.quantity)}</p>
                          <button
                            onClick={() => handleRemove(item.bookId)}
                            className="text-coral hover:text-red-600 mt-2"
                            title="Remove from cart"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      {stockErrors[item.bookId] && (
                        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3">
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                          <p className="text-red-800 text-sm font-medium">{stockErrors[item.bookId]}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <Card className="card-base p-6 sticky top-20">
                    <h2 className="font-serif font-bold text-lg mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPeso(subtotal)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mb-6">
                      <span className="font-serif font-bold text-lg">Total</span>
                      <span className="text-coral font-bold text-lg">{formatPeso(total)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full bg-coral text-white font-semibold py-3 rounded-full hover:bg-red-600 transition flex items-center justify-center gap-2 mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          {isLoggedIn ? "Proceed to Checkout" : "Sign In to Checkout"}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                    <Link href="/catalog">
                      <Button className="btn-outline w-full rounded-full">Continue Shopping</Button>
                    </Link>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
