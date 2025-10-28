"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getGuestCart, GuestCartItem } from "@/lib/guest-cart"
import { formatPeso } from "@/lib/currency"
import {
  MapPin,
  Home,
  Store,
  Loader,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react"

interface GuestCheckoutData {
  email: string
  fullName: string
  phone: string
  address: string
  city: string
  postalCode: string
  deliveryMethod: "pickup" | "delivery"
}

export default function GuestCheckout() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState<GuestCheckoutData>({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryMethod: "delivery",
  })

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user._id)
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      }))
    }

    const items = getGuestCart()
    if (items.length === 0) {
      router.push("/cart")
      return
    }
    setCartItems(items)
    setLoading(false)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeliveryMethodChange = (method: "pickup" | "delivery") => {
    setFormData(prev => ({
      ...prev,
      deliveryMethod: method,
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.fullName || !formData.phone) {
      setError("Please fill in all required fields")
      return false
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }

    if (formData.deliveryMethod === "delivery") {
      if (!formData.address || !formData.city || !formData.postalCode) {
        setError("Please fill in all delivery address fields")
        return false
      }
    }

    return true
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Create order (user or guest)
      const orderPayload: any = {
        items: cartItems.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryMethod: formData.deliveryMethod,
        total: subtotal + tax + deliveryFee,
      }

      // If user is logged in, pass userId and shipping address
      if (userId) {
        orderPayload.userId = userId
        orderPayload.shippingAddress =
          formData.deliveryMethod === "pickup"
            ? "Store Pickup"
            : `${formData.address}, ${formData.city} ${formData.postalCode}`
      } else {
        // Otherwise use guest details
        orderPayload.guestEmail = formData.email
        orderPayload.guestName = formData.fullName
        orderPayload.guestPhone = formData.phone
        orderPayload.guestAddress =
          formData.deliveryMethod === "pickup"
            ? "Store Pickup"
            : `${formData.address}, ${formData.city} ${formData.postalCode}`
      }

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()

      // Redirect to payment page with order ID
      router.push(`/checkout/payment?orderId=${orderData.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const tax = subtotal * 0.12
  const deliveryFee = formData.deliveryMethod === "delivery" ? 100 : 0
  const total = subtotal + tax + deliveryFee

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white">
          <div className="py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Header Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Email Section */}
                  <Card className="card-base p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  </Card>

                  {/* Delivery Method */}
                  <Card className="card-base p-6">
                    <div className="h-6 bg-gray-300 rounded w-40 animate-pulse mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </Card>

                  {/* Address Form */}
                  <Card className="card-base p-6 space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </Card>

                  {/* Payment Method */}
                  <Card className="card-base p-6">
                    <div className="h-6 bg-gray-300 rounded w-40 animate-pulse mb-4"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  </Card>
                </div>

                {/* Order Summary Skeleton */}
                <Card className="card-base p-6 h-fit space-y-4">
                  <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>

                  {/* Items */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-gray-200 pb-3 last:border-0">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="h-10 bg-gold rounded animate-pulse"></div>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <Card className="card-base p-4 bg-red-50 border-l-4 border-red-500">
                  <div className="flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </Card>
              )}

              {success && (
                <Card className="card-base p-4 bg-green-50 border-l-4 border-green-500">
                  <div className="flex gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                    <p className="text-green-800 text-sm">Order created successfully! Redirecting to payment...</p>
                  </div>
                </Card>
              )}

              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Guest Information */}
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-xl mb-4">Guest Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Full Name *</label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+63 9XX XXX XXXX"
                        required
                      />
                    </div>
                  </div>
                </Card>

                {/* Delivery Method */}
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-xl mb-4">Delivery Method</h2>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleDeliveryMethodChange("delivery")}
                      className={`w-full p-4 border-2 rounded-lg transition flex items-center gap-3 ${
                        formData.deliveryMethod === "delivery"
                          ? "border-gold bg-cream"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MapPin
                        size={24}
                        className={
                          formData.deliveryMethod === "delivery"
                            ? "text-gold"
                            : "text-gray-400"
                        }
                      />
                      <div className="text-left">
                        <p className="font-semibold">Delivery</p>
                        <p className="text-sm text-gray-600">+₱100 delivery fee</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeliveryMethodChange("pickup")}
                      className={`w-full p-4 border-2 rounded-lg transition flex items-center gap-3 ${
                        formData.deliveryMethod === "pickup"
                          ? "border-gold bg-cream"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Store
                        size={24}
                        className={
                          formData.deliveryMethod === "pickup"
                            ? "text-gold"
                            : "text-gray-400"
                        }
                      />
                      <div className="text-left">
                        <p className="font-semibold">Store Pickup</p>
                        <p className="text-sm text-gray-600">Free - Pick up at our store</p>
                      </div>
                    </button>
                  </div>
                </Card>

                {/* Delivery Address (conditional) */}
                {formData.deliveryMethod === "delivery" && (
                  <Card className="card-base p-6">
                    <h2 className="font-serif font-bold text-xl mb-4">Delivery Address</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Street Address *</label>
                        <Input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="123 Main Street"
                          required={formData.deliveryMethod === "delivery"}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">City *</label>
                          <Input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Manila"
                            required={formData.deliveryMethod === "delivery"}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Postal Code *</label>
                          <Input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="1000"
                            required={formData.deliveryMethod === "delivery"}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Payment Method */}
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-xl mb-4">Payment Method</h2>
                  <div className="p-4 border-2 border-gold bg-cream rounded-lg flex items-center gap-3">
                    <CreditCard size={24} className="text-gold" />
                    <div>
                      <p className="font-semibold">QR Payment (PayMongo)</p>
                      <p className="text-sm text-gray-600">
                        Pay securely using QR code on the next page
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn-secondary w-full py-4 text-lg rounded-full flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  )}
                  {submitting ? "Creating Order..." : "Proceed to Payment"}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="card-base p-6 sticky top-20">
                <h2 className="font-serif font-bold text-lg mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {cartItems.map(item => (
                    <div key={item.bookId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatPeso(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPeso(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (12%)</span>
                    <span>{formatPeso(tax)}</span>
                  </div>
                  {formData.deliveryMethod === "delivery" && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>{formatPeso(deliveryFee)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-serif font-bold text-lg">Total</span>
                  <span className="text-coral font-bold text-2xl">
                    {formatPeso(total)}
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
