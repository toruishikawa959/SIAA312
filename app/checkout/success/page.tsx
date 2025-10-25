"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, Loader, AlertCircle } from "lucide-react"
import { formatPeso } from "@/lib/currency"
import { clearGuestCart } from "@/lib/guest-cart"

interface OrderData {
  _id: string
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: string
  paymentStatus: string
  deliveryMethod: string
  shippingAddress: string
  guestEmail?: string
  guestName?: string
  guestPhone?: string
  createdAt: string
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided")
      setLoading(false)
      return
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderId=${orderId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch order")
        }
        const data = await response.json()
        setOrder(data)

        // Clear guest cart after successful order
        clearGuestCart()

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white flex items-center justify-center">
          <Loader className="animate-spin text-gold" size={32} />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-off-white py-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {error ? (
            <Card className="card-base p-8 text-center bg-red-50 border-l-4 border-red-500">
              <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
              <h1 className="font-serif text-2xl font-bold text-red-800 mb-2">Error</h1>
              <p className="text-red-700 mb-6">{error}</p>
              <Link href="/catalog">
                <Button className="btn-secondary rounded-full">Back to Catalog</Button>
              </Link>
            </Card>
          ) : order ? (
            <div className="space-y-6">
              {/* Success Message */}
              <Card className="card-base p-8 text-center bg-green-50 border-2 border-green-200">
                <CheckCircle className="text-green-600 mx-auto mb-4" size={56} />
                <h1 className="font-serif text-3xl font-bold text-green-900 mb-2">
                  Order Confirmed!
                </h1>
                <p className="text-green-700 mb-4">
                  Thank you for your purchase. Your order has been successfully placed.
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <p className="text-gray-600 text-sm mb-1">Order Number</p>
                  <p className="font-mono font-bold text-lg">{orderId}</p>
                </div>
              </Card>

              {/* Order Details */}
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-xl mb-4">Order Details</h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.title} x{item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatPeso(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg text-coral">
                      {formatPeso(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Method</span>
                    <span className="font-semibold capitalize">
                      {order.deliveryMethod === "pickup" ? "Store Pickup" : "Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-semibold text-green-600">
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Delivery Information */}
              {order.shippingAddress && (
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-lg mb-4">
                    {order.deliveryMethod === "pickup" ? "Pickup Information" : "Delivery Address"}
                  </h2>
                  <div className="bg-off-white p-4 rounded-lg">
                    <p className="text-gray-600 text-sm mb-1">
                      {order.deliveryMethod === "pickup" ? "Location" : "Address"}
                    </p>
                    <p className="font-semibold">{order.shippingAddress}</p>
                  </div>
                </Card>
              )}

              {/* Guest Contact Information */}
              {order.guestEmail && (
                <Card className="card-base p-6">
                  <h2 className="font-serif font-bold text-lg mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{order.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{order.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{order.guestPhone}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Next Steps */}
              <Card className="card-base p-6 bg-blue-50 border-2 border-blue-200">
                <h3 className="font-serif font-bold text-lg mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-blue-900">
                  {order.deliveryMethod === "pickup" ? (
                    <>
                      <li>✓ Your order is confirmed and being prepared</li>
                      <li>✓ You will receive an email notification when it's ready for pickup</li>
                      <li>✓ Visit our store to pick up your order</li>
                    </>
                  ) : (
                    <>
                      <li>✓ Your order is confirmed and being prepared</li>
                      <li>✓ You will receive an email notification with tracking information</li>
                      <li>✓ Your order will be delivered to the address provided</li>
                    </>
                  )}
                </ul>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/catalog" className="flex-1">
                  <Button className="btn-secondary w-full rounded-full py-3 flex items-center justify-center gap-2">
                    <Home size={20} />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/orders" className="flex-1">
                  <Button className="btn-primary w-full rounded-full py-3">View All Orders</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white flex items-center justify-center">
          <Loader className="animate-spin text-gold" size={32} />
        </main>
        <Footer />
      </>
    }>
      <SuccessContent />
    </Suspense>
  )
}
