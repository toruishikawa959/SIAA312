"use client"

import { useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { PageLoader } from "@/components/page-loader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/protected-route"
import { AlertCircle, CheckCircle, Loader, Copy } from "lucide-react"

export default function MockPaymentPage() {
  const [orderId, setOrderId] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [copiedOrderId, setCopiedOrderId] = useState(false)

  const handleMockPayment = async () => {
    if (!orderId.trim()) {
      setError("Please enter an Order ID")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess(false)

      const response = await fetch(`/api/test/mock-payment?orderId=${orderId}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to process mock payment")
        return
      }

      setSuccess(true)
      setOrderId("")
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process mock payment")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId)
      setCopiedOrderId(true)
      setTimeout(() => setCopiedOrderId(false), 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleMockPayment()
    }
  }

  return (
    <ProtectedRoute requiredRole="staff">
      <>
        <StaffSidebar />
        <PageLoader />
        <main className="min-h-screen bg-off-white md:ml-64">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h1 className="font-serif text-4xl font-bold mb-2">Mock Payment Testing</h1>
                <p className="text-gray-600">
                  Simulate order payment to test the confirmation workflow
                </p>
              </div>

              {/* Info Card */}
              <Card className="card-base p-6 mb-8 bg-blue-50 border-2 border-blue-200">
                <div className="flex gap-4">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Development Only</h3>
                    <p className="text-sm text-blue-800">
                      This tool simulates a PayMongo webhook payment. It updates the order status to "paid" 
                      and sends confirmation emails to the customer and staff. This is for testing purposes only.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Input Card */}
              <Card className="card-base p-8 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-3">Order ID</label>
                    <p className="text-xs text-gray-600 mb-3">
                      Enter a MongoDB Order ID (24-character hex string)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="e.g., 507f1f77bcf86cd799439011"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border-2 border-gray-300 rounded px-3 py-2 focus:border-gold"
                      />
                      {orderId && (
                        <Button
                          onClick={copyToClipboard}
                          className="bg-gray-400 hover:bg-gray-500 text-white flex items-center gap-2"
                          title="Copy Order ID"
                        >
                          <Copy size={16} />
                          {copiedOrderId ? "Copied!" : "Copy"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex gap-3">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                      <div className="flex gap-3">
                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                        <div className="text-green-800 text-sm">
                          <p className="font-semibold">Payment processed successfully!</p>
                          <p>Order has been marked as paid and emails have been sent.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleMockPayment}
                      disabled={loading || !orderId.trim()}
                      className="flex-1 bg-gold hover:bg-yellow-500 text-charcoal font-semibold flex items-center justify-center gap-2"
                    >
                      {loading && <Loader size={16} className="animate-spin" />}
                      {loading ? "Processing..." : "Process Mock Payment"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Instructions Card */}
              <Card className="card-base p-6">
                <h3 className="font-serif text-lg font-bold mb-4">How to Use</h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold text-charcoal rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span>Create an order in the checkout flow</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold text-charcoal rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span>Copy the Order ID from the pending order</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold text-charcoal rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span>Paste it into the input field above</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold text-charcoal rounded-full flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <span>Click "Process Mock Payment"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gold text-charcoal rounded-full flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <span>Order will be marked as paid and emails will be sent</span>
                  </li>
                </ol>
              </Card>

              {/* What Happens Card */}
              <Card className="card-base p-6 mt-6 bg-amber-50 border-2 border-amber-200">
                <h3 className="font-serif text-lg font-bold mb-4 text-amber-900">What Happens</h3>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    Order status changes from "pending" to "confirmed"
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    Payment status changes to "paid"
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    Confirmation email sent to customer
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    Order alert sent to staff email
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    Order appears in Orders Dashboard
                  </li>
                </ul>
              </Card>
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  )
}
