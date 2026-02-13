"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DevNavigation } from "@/components/dev-navigation"
import { Ticket, Loader, CheckCircle, AlertCircle, Copy, RefreshCw } from "lucide-react"

interface CouponStatus {
  exists: boolean
  coupon?: {
    code: string
    discountType: string
    discountAmount: number
    minPurchaseAmount: number
    expirationDate: string
    isActive: boolean
    isExpired: boolean
    usedCount: number
    maxUses: number
    remainingUses: number | string
  }
  status?: string
}

export default function DemoCouponPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [couponStatus, setCouponStatus] = useState<CouponStatus | null>(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Check coupon status on load
  useEffect(() => {
    checkCouponStatus()
  }, [])

  const checkCouponStatus = async () => {
    try {
      setChecking(true)
      const res = await fetch("/api/dev/coupons/demo")
      const data = await res.json()
      setCouponStatus(data)
    } catch (err) {
      console.error("Error checking coupon status:", err)
    } finally {
      setChecking(false)
    }
  }

  const createDemoCoupon = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const res = await fetch("/api/dev/coupons/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message)
        setCouponStatus({
          exists: true,
          coupon: {
            code: data.usage.code,
            discountType: "PERCENTAGE",
            discountAmount: 20,
            minPurchaseAmount: 500,
            expirationDate: data.coupon.expirationDate,
            isActive: true,
            isExpired: false,
            usedCount: 0,
            maxUses: 100,
            remainingUses: 100,
          },
          status: "active",
        })
      } else {
        setError(data.error || "Failed to create demo coupon")
      }
    } catch (err) {
      setError("Error creating demo coupon")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText("DEMO20")
    alert("Coupon code DEMO20 copied to clipboard!")
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "expired":
        return "bg-red-100 text-red-800 border-red-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
    }
  }

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Ticket size={32} />
              🎟️ Demo Coupon
            </h1>
            <p className="text-gray-600">
              Create a ready-to-use demo coupon for your presentations and testing
            </p>
          </div>

          {error && (
            <Card className="p-4 bg-red-50 border-l-4 border-red-500 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800">{error}</p>
              </div>
            </Card>
          )}

          {success && (
            <Card className="p-4 bg-green-50 border-l-4 border-green-500 mb-6">
              <div className="flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-green-800">{success}</p>
              </div>
            </Card>
          )}

          {checking ? (
            <Card className="p-8 text-center">
              <Loader className="animate-spin mx-auto mb-4" size={32} />
              <p className="text-gray-600">Checking coupon status...</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Coupon Status Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Coupon Status</h2>
                  <Button
                    onClick={checkCouponStatus}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                </div>

                {couponStatus?.exists ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Ticket className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold font-mono">DEMO20</p>
                          <p className="text-sm text-gray-500">Demo Coupon Code</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          couponStatus.status
                        )}`}
                      >
                        {couponStatus.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-semibold">20% OFF</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Min. Purchase</p>
                        <p className="font-semibold">₱500</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Uses</p>
                        <p className="font-semibold">
                          {couponStatus.coupon?.usedCount} / {couponStatus.coupon?.maxUses}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-semibold">
                          {couponStatus.coupon?.isExpired
                            ? "Expired"
                            : new Date(couponStatus.coupon?.expirationDate || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={copyCode}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Copy size={18} className="mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        onClick={createDemoCoupon}
                        disabled={loading}
                        variant="outline"
                        className="flex-1"
                      >
                        {loading ? (
                          <Loader size={18} className="animate-spin mr-2" />
                        ) : (
                          <RefreshCw size={18} className="mr-2" />
                        )}
                        Reset Coupon
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="text-yellow-600" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Demo Coupon Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create a demo coupon to use in your presentations and testing
                    </p>
                    <Button
                      onClick={createDemoCoupon}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      {loading ? (
                        <>
                          <Loader size={20} className="animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Ticket size={20} className="mr-2" />
                          Create Demo Coupon
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>

              {/* Usage Instructions */}
              <Card className="p-6 bg-blue-50 border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-4">📖 How to Use</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </span>
                    <p className="text-gray-700">
                      <strong>Copy the code</strong> - Click "Copy Code" to copy DEMO20 to your clipboard
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </span>
                    <p className="text-gray-700">
                      <strong>Go to checkout</strong> - Add items worth at least ₱500 to your cart
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </span>
                    <p className="text-gray-700">
                      <strong>Apply coupon</strong> - Enter DEMO20 in the coupon field at checkout
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      4
                    </span>
                    <p className="text-gray-700">
                      <strong>Enjoy 20% off!</strong> - The discount will be automatically applied
                    </p>
                  </div>
                </div>
              </Card>

              {/* Test Scenarios */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">🧪 Test Scenarios</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>Valid application:</strong> Cart total ₱500+ with code DEMO20</p>
                  <p>• <strong>Below minimum:</strong> Cart total ₱400 with code DEMO20 (should fail)</p>
                  <p>• <strong>Invalid code:</strong> Try code INVALID123 (should not exist)</p>
                  <p>• <strong>Expired coupon:</strong> Wait 90 days or reset to test expiration</p>
                  <p>• <strong>Usage limit:</strong> Use coupon 100 times to test max uses</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
