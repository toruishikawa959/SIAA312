"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DevNavigation } from "@/components/dev-navigation"
import { Ticket, Loader, CheckCircle, AlertCircle, Copy } from "lucide-react"

export default function DevCouponGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [generatedCoupons, setGeneratedCoupons] = useState<string[]>([])

  // Coupon settings
  const [count, setCount] = useState(10)
  const [prefix, setPrefix] = useState("SAVE")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountAmount, setDiscountAmount] = useState(10)
  const [minPurchase, setMinPurchase] = useState(500)
  const [daysValid, setDaysValid] = useState(30)
  const [maxUses, setMaxUses] = useState(100)

  const handleGenerate = async () => {
    if (!confirm(`Generate ${count} coupons with ${discountAmount}${discountType === 'percentage' ? '%' : '₱'} discount?`)) {
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      setGeneratedCoupons([])

      const res = await fetch("/api/dev/coupons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count,
          prefix,
          discountType,
          discountAmount,
          minPurchase,
          daysValid,
          maxUses,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message || "Coupons generated successfully!")
        setGeneratedCoupons(data.codes || [])
      } else {
        setError(data.error || "Failed to generate coupons")
      }
    } catch (err) {
      setError("Error generating coupons: " + err)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyAllCodes = () => {
    const text = generatedCoupons.join('\n')
    navigator.clipboard.writeText(text)
    alert('All coupon codes copied to clipboard!')
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Ticket size={32} />
              🔧 DEV MODE - Coupon Generator
            </h1>
            <p className="text-gray-600">⚠️ Generate discount coupons for testing and promotions. FOR DEVELOPMENT ONLY!</p>
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

          <div className="space-y-6">
            {/* Generation Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">🎟️ Coupon Settings</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Number of Coupons</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many coupon codes to generate</p>
                </div>

                <div>
                  <Label>Code Prefix</Label>
                  <Input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    className="mt-2"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Prefix for coupon codes (e.g., SAVE, PROMO)</p>
                </div>

                <div>
                  <Label>Discount Type</Label>
                  <div className="flex gap-4 mt-2">
                    <Button
                      onClick={() => setDiscountType("percentage")}
                      className={`flex-1 ${discountType === "percentage" ? 'bg-blue-600' : 'bg-gray-400'}`}
                    >
                      Percentage %
                    </Button>
                    <Button
                      onClick={() => setDiscountType("fixed")}
                      className={`flex-1 ${discountType === "fixed" ? 'bg-blue-600' : 'bg-gray-400'}`}
                    >
                      Fixed ₱
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Discount Amount</Label>
                  <Input
                    type="number"
                    min="1"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {discountType === "percentage" ? "Percentage off (1-100)" : "Fixed peso amount off"}
                  </p>
                </div>

                <div>
                  <Label>Minimum Purchase (₱)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum cart value required</p>
                </div>

                <div>
                  <Label>Valid for (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={daysValid}
                    onChange={(e) => setDaysValid(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of days until expiration</p>
                </div>

                <div>
                  <Label>Max Uses per Coupon</Label>
                  <Input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">How many times each code can be used</p>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 bg-blue-50 border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-2">Preview</h3>
              <p className="text-gray-700">
                Generating <strong>{count}</strong> coupons with code format: <strong>{prefix}XXXX</strong>
              </p>
              <p className="text-gray-700">
                Discount: <strong>{discountAmount}{discountType === "percentage" ? "%" : "₱"}</strong> off
              </p>
              <p className="text-gray-700">
                Minimum purchase: <strong>₱{minPurchase}</strong>
              </p>
              <p className="text-gray-700">
                Expires in: <strong>{daysValid} days</strong>
              </p>
              <p className="text-gray-700">
                Max uses: <strong>{maxUses} per code</strong>
              </p>
            </Card>

            {/* Generate Button */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Ready to Generate?</h3>
                  <p className="text-sm text-gray-600">
                    This will create {count} new coupon codes in the database
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Ticket size={20} className="mr-2" />
                      Generate Coupons
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Generated Coupons Display */}
            {generatedCoupons.length > 0 && (
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">✅ Generated Coupon Codes</h3>
                  <Button
                    onClick={copyAllCodes}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy All
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {generatedCoupons.map((code, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-100 rounded border border-gray-300 flex items-center justify-between group hover:bg-gray-200 cursor-pointer"
                      onClick={() => copyCode(code)}
                    >
                      <code className="font-mono font-bold text-sm">{code}</code>
                      <Copy size={14} className="text-gray-400 group-hover:text-gray-600" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  💡 Click any code to copy it to clipboard
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
