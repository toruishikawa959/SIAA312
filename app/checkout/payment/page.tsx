"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Clock,
  ChevronRight,
} from "lucide-react"
import { formatPeso } from "@/lib/currency"

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

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")

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
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleInitiatePayment = async () => {
    if (!orderId) return

    setPaymentInitiated(true)
    setPaymentStatus("processing")

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: order?.totalAmount,
          description: `Order #${orderId} - Bookstore`,
          email: order?.guestEmail,
          name: order?.guestName,
          phone: order?.guestPhone,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to initiate payment")
      }

      const paymentData = await response.json()
      setQrCode(paymentData.qrCode)
      setPaymentStatus("success")

      // Poll for payment status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/payment?orderId=${orderId}`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          if (statusData.paymentStatus === "paid") {
            setPaymentStatus("success")
            clearInterval(pollInterval)
            // Redirect to confirmation after 2 seconds
            setTimeout(() => {
              router.push(`/checkout/success?orderId=${orderId}`)
            }, 2000)
          }
        }
      }, 3000)

      return () => clearInterval(pollInterval)
    } catch (err) {
      setPaymentStatus("failed")
      setError(err instanceof Error ? err.message : "Payment initiation failed")
    }
  }

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

  if (!order) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-off-white py-12 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="card-base p-6 bg-red-50 border-l-4 border-red-500">
              <div className="flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-red-800">Order Not Found</p>
                  <p className="text-red-700 mt-1">{error || "Could not load order details"}</p>
                </div>
              </div>
            </Card>
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
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl font-bold mb-8">Payment</h1>

          <div className="space-y-6">
            {/* Order ID */}
            <Card className="card-base p-6 bg-cream">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="font-mono font-bold text-lg">{orderId}</p>
                </div>
                <CheckCircle className="text-gold" size={32} />
              </div>
            </Card>

            {error && (
              <Card className="card-base p-6 bg-red-50 border-l-4 border-red-500">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-800">{error}</p>
                </div>
              </Card>
            )}

            {/* Order Details */}
            <Card className="card-base p-6">
              <h2 className="font-serif font-bold text-lg mb-4">Order Details</h2>

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
                  <span className="font-semibold capitalize">{order.deliveryMethod}</span>
                </div>
              </div>
            </Card>

            {/* Payment Method Section */}
            {!paymentInitiated ? (
              <Card className="card-base p-6 border-2 border-gold">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="text-gold" size={24} />
                    <h2 className="font-serif font-bold text-lg">QR Payment via PayMongo</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Click below to generate your payment QR code. Scan it with any mobile payment app to complete your purchase.
                  </p>
                </div>

                <Button
                  onClick={handleInitiatePayment}
                  className="btn-secondary w-full py-4 text-lg rounded-full flex items-center justify-center gap-2"
                >
                  Generate Payment QR Code
                  <ChevronRight size={20} />
                </Button>
              </Card>
            ) : paymentStatus === "processing" ? (
              <Card className="card-base p-8 bg-blue-50 border-2 border-blue-200">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="animate-spin text-blue-600" size={40} />
                  <p className="font-semibold text-blue-900">Generating QR Code...</p>
                </div>
              </Card>
            ) : paymentStatus === "success" && qrCode ? (
              <Card className="card-base p-8">
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-gray-600 mb-3">Scan this QR code to pay</p>
                    <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
                      <img
                        src={qrCode}
                        alt="Payment QR Code"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                    <div className="flex gap-2">
                      <Clock className="text-amber-600 flex-shrink-0" size={20} />
                      <div className="text-left">
                        <p className="font-semibold text-amber-900">Payment will be verified shortly</p>
                        <p className="text-amber-700 text-xs">
                          Please wait after scanning the QR code. You will be redirected once payment is confirmed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600">Amount to Pay</p>
                    <p className="font-serif font-bold text-3xl text-coral mt-2">
                      {formatPeso(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="card-base p-6 bg-red-50 border-l-4 border-red-500">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-800">Failed to generate payment QR code. Please try again.</p>
                </div>
              </Card>
            )}

            {/* Delivery Address */}
            {order.shippingAddress && (
              <Card className="card-base p-6">
                <h2 className="font-serif font-bold text-lg mb-4">Delivery Information</h2>
                <div className="bg-off-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-semibold mt-1">{order.shippingAddress}</p>
                </div>
              </Card>
            )}

            {/* Guest/Customer Info */}
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
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function PaymentPage() {
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
      <PaymentContent />
    </Suspense>
  )
}
