"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DevNavigation } from "@/components/dev-navigation"
import { Calendar, Loader, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"

export default function DevCurrentYearDataPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Monthly order settings for current year
  const [monthlyOrders, setMonthlyOrders] = useState<{ [key: number]: { min: number, max: number } }>({
    1: { min: 20, max: 35 },
    2: { min: 20, max: 35 },
    3: { min: 20, max: 35 },
    4: { min: 20, max: 35 },
    5: { min: 20, max: 35 },
    6: { min: 20, max: 35 },
    7: { min: 20, max: 35 },
    8: { min: 20, max: 35 },
    9: { min: 20, max: 35 },
    10: { min: 20, max: 35 },
    11: { min: 20, max: 35 },
    12: { min: 20, max: 35 },
  })

  const [autoAdjustToDate, setAutoAdjustToDate] = useState(true)
  const [appendMode, setAppendMode] = useState(false)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleGenerate = async () => {
    const message = appendMode
      ? `This will ADD new orders for ${currentYear} up to ${autoAdjustToDate ? 'today' : 'December'}. Continue?`
      : `This will REPLACE existing ${currentYear} orders with new data up to ${autoAdjustToDate ? 'today' : 'December'}. Continue?`
    
    if (!confirm(message)) {
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const res = await fetch("/api/dev/data-generator/current-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          monthlyOrders,
          autoAdjustToDate,
          appendMode,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message || "Current year data generated successfully!")
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

  const updateMonthOrders = (month: number, field: 'min' | 'max', value: number) => {
    setMonthlyOrders(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [field]: value
      }
    }))
  }

  const setAllMonths = (min: number, max: number) => {
    const newOrders: { [key: number]: { min: number, max: number } } = {}
    for (let i = 1; i <= 12; i++) {
      newOrders[i] = { min, max }
    }
    setMonthlyOrders(newOrders)
  }

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Calendar size={32} />
              🔧 DEV MODE - Current Year Data Generator
            </h1>
            <p className="text-gray-600">⚠️ Generate data for {currentYear} up to current date. FOR DEVELOPMENT ONLY!</p>
            <p className="text-sm text-blue-600 font-semibold mt-2">
              📅 Today: {currentDate}
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

          <div className="space-y-6">
            {/* Auto-adjust Settings */}
            <Card className="p-6 bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Calendar size={20} />
                    Smart Date Adjustment
                  </h2>
                  <p className="text-sm text-gray-700">
                    {autoAdjustToDate 
                      ? `Will generate orders only up to ${currentDate} (current date)`
                      : `Will generate orders for entire year including future months`
                    }
                  </p>
                </div>
                <Button
                  onClick={() => setAutoAdjustToDate(!autoAdjustToDate)}
                  className={`${autoAdjustToDate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                >
                  {autoAdjustToDate ? 'Auto-Adjust: ON' : 'Auto-Adjust: OFF'}
                </Button>
              </div>
            </Card>

            {/* Quick Presets */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">⚡ Quick Presets</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => setAllMonths(5, 15)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Low (5-15)
                </Button>
                <Button
                  onClick={() => setAllMonths(20, 35)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Medium (20-35)
                </Button>
                <Button
                  onClick={() => setAllMonths(40, 60)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  High (40-60)
                </Button>
                <Button
                  onClick={() => setAllMonths(70, 100)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Peak (70-100)
                </Button>
              </div>
            </Card>

            {/* Monthly Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">📅 Monthly Order Configuration for {currentYear}</h2>
              <p className="text-sm text-gray-600 mb-4">
                Set min/max orders per month. {autoAdjustToDate && `Only months up to ${monthNames[currentMonth - 1]} will generate data.`}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {monthNames.map((monthName, index) => {
                  const monthNum = index + 1
                  const isPastOrCurrent = monthNum <= currentMonth
                  const isFuture = monthNum > currentMonth
                  
                  return (
                    <div 
                      key={monthNum} 
                      className={`p-4 rounded-lg border-2 ${
                        isFuture && autoAdjustToDate 
                          ? 'bg-gray-100 opacity-50' 
                          : monthNum === currentMonth 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {monthName} {currentYear}
                          {monthNum === currentMonth && (
                            <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                          {isFuture && autoAdjustToDate && (
                            <span className="ml-2 text-xs bg-gray-400 text-white px-2 py-1 rounded">
                              Skipped
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Min/Month</Label>
                          <Input
                            type="number"
                            value={monthlyOrders[monthNum].min}
                            onChange={(e) => updateMonthOrders(monthNum, 'min', parseInt(e.target.value) || 0)}
                            className="mt-1"
                            disabled={isFuture && autoAdjustToDate}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max/Month</Label>
                          <Input
                            type="number"
                            value={monthlyOrders[monthNum].max}
                            onChange={(e) => updateMonthOrders(monthNum, 'max', parseInt(e.target.value) || 0)}
                            className="mt-1"
                            disabled={isFuture && autoAdjustToDate}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Mode Selection */}
            <Card className="p-6 bg-orange-50 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">Generation Mode</h3>
                  <p className="text-sm text-gray-600">
                    {appendMode ? `✅ Append Mode: Add new ${currentYear} orders to existing data` : `⚠️ Replace Mode: Delete existing ${currentYear} orders before generating`}
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
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Ready to Generate {currentYear} Data?
                  </h3>
                  <p className="text-sm text-gray-600">
                    {appendMode ? 'Will add to existing data. ' : 'Will replace existing data. '}
                    {autoAdjustToDate 
                      ? `Orders from January to ${monthNames[currentMonth - 1]} ${new Date().getDate()}, ${currentYear}`
                      : `Orders for the entire year ${currentYear}`
                    }
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
                      <Calendar size={20} className="mr-2" />
                      Generate {currentYear}
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
