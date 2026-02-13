"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DevNavigation } from "@/components/dev-navigation"
import { Sparkles, Loader, CheckCircle, AlertCircle } from "lucide-react"

export default function DevDataGeneratorPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Order generation settings
  const [years, setYears] = useState(5)
  const [year1Orders, setYear1Orders] = useState({ min: 5, max: 15 })
  const [year2Orders, setYear2Orders] = useState({ min: 30, max: 50 })
  const [year3Orders, setYear3Orders] = useState({ min: 35, max: 55 })
  const [year4Orders, setYear4Orders] = useState({ min: 40, max: 60 })
  const [year5Orders, setYear5Orders] = useState({ min: 20, max: 35 })

  // Newsletter & Address settings
  const [newsletterCount, setNewsletterCount] = useState(500)
  const [addressCount, setAddressCount] = useState(400)
  const [appendMode, setAppendMode] = useState(false)

  const handleGenerate = async () => {
    const message = appendMode 
      ? "This will ADD new data to existing orders, newsletters, and addresses. Continue?"
      : "This will CLEAR existing orders, newsletters, and addresses first. Continue?"
    
    if (!confirm(message)) {
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const res = await fetch("/api/dev/data-generator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          years,
          orderPatterns: [year1Orders, year2Orders, year3Orders, year4Orders, year5Orders],
          newsletterCount,
          addressCount,
          appendMode,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message || "Data generated successfully!")
      } else {
        setError(data.error || "Failed to generate data")
      }
    } catch (err) {
      setError("Error generating data: " + err)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Sparkles size={32} />
              🔧 DEV MODE - Dummy Data Generator
            </h1>
            <p className="text-gray-600">⚠️ Generate realistic historical data for testing. FOR DEVELOPMENT ONLY!</p>
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
            {/* Years Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📅 Time Period</h2>
              <div className="space-y-4">
                <div>
                  <Label>Number of Years</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={years}
                    onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Generate data from {new Date().getFullYear() - years} to {new Date().getFullYear() - 1}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Patterns */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📦 Order Generation Patterns</h2>
              <p className="text-sm text-gray-600 mb-4">
                Set min/max orders per month for each year to create realistic growth trends
              </p>
              
              <div className="space-y-6">
                {/* Year 1 - Low */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-yellow-800">
                    Year 1 ({new Date().getFullYear() - 5}) - Low Growth Phase
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Orders/Month</Label>
                      <Input
                        type="number"
                        value={year1Orders.min}
                        onChange={(e) => setYear1Orders({ ...year1Orders, min: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Orders/Month</Label>
                      <Input
                        type="number"
                        value={year1Orders.max}
                        onChange={(e) => setYear1Orders({ ...year1Orders, max: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Year 2 - High */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-green-800">
                    Year 2 ({new Date().getFullYear() - 4}) - High Growth Phase
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Orders/Month</Label>
                      <Input
                        type="number"
                        value={year2Orders.min}
                        onChange={(e) => setYear2Orders({ ...year2Orders, min: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Orders/Month</Label>
                      <Input
                        type="number"
                        value={year2Orders.max}
                        onChange={(e) => setYear2Orders({ ...year2Orders, max: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Year 3 - High */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-green-800">
                    Year 3 ({new Date().getFullYear() - 3}) - High Growth Phase
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Orders/Month</Label>
                      <Input
                        type="number"
                        value={year3Orders.min}
                        onChange={(e) => setYear3Orders({ ...year3Orders, min: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Orders/Month</Label>
                      <Input
                        type="number"
                        value={year3Orders.max}
                        onChange={(e) => setYear3Orders({ ...year3Orders, max: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Year 4 - High */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-green-800">
                    Year 4 ({new Date().getFullYear() - 2}) - High Growth Phase
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Orders/Month</Label>
                      <Input
                        type="number"
                        value={year4Orders.min}
                        onChange={(e) => setYear4Orders({ ...year4Orders, min: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Orders/Month</Label>
                      <Input
                        type="number"
                        value={year4Orders.max}
                        onChange={(e) => setYear4Orders({ ...year4Orders, max: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Year 5 - Medium */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-3 text-blue-800">
                    Year 5 ({new Date().getFullYear() - 1}) - Stable/Medium Phase
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Orders/Month</Label>
                      <Input
                        type="number"
                        value={year5Orders.min}
                        onChange={(e) => setYear5Orders({ ...year5Orders, min: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Max Orders/Month</Label>
                      <Input
                        type="number"
                        value={year5Orders.max}
                        onChange={(e) => setYear5Orders({ ...year5Orders, max: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Other Data */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📧 Other Data Generation</h2>
              <div className="space-y-4">
                <div>
                  <Label>Newsletter Subscribers</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newsletterCount}
                    onChange={(e) => setNewsletterCount(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Customer Addresses</Label>
                  <Input
                    type="number"
                    min="0"
                    value={addressCount}
                    onChange={(e) => setAddressCount(parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Mode Selection */}
            <Card className="p-6 bg-orange-50 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Generation Mode</h3>
                  <p className="text-sm text-gray-600">
                    {appendMode ? '✅ Append Mode: Add new data to existing records' : '⚠️ Replace Mode: Clear all data before generating'}
                  </p>
                </div>
                <Button
                  onClick={() => setAppendMode(!appendMode)}
                  className={`${appendMode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6`}
                >
                  {appendMode ? 'Append Mode' : 'Replace Mode'}
                </Button>
              </div>
            </Card>

            {/* Generate Button */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Ready to Generate?</h3>
                  <p className="text-sm text-gray-600">
                    {appendMode ? 'This will add new data to existing records' : 'This will clear existing orders, newsletters, and addresses'}
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="mr-2" />
                      Generate Data
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
