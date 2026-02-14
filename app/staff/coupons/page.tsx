"use client"

import { useEffect, useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPeso } from "@/lib/currency"
import { Download, Search, Tag, TrendingUp, Users } from "lucide-react"

interface Coupon {
  _id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountAmount: number
  minPurchaseAmount: number
  expirationDate: string
  isActive: boolean
  maxUses?: number
  usedCount: number
  applicableCategories?: string[]
  maxUsesPerUser?: number
  isFirstTimeCustomerOnly?: boolean
  createdAt: string
}

export default function StaffCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<string>("all")

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      if (data.success) {
        setCoupons(data.coupons)
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Code",
      "Type",
      "Amount",
      "Min Purchase",
      "Status",
      "Usage",
      "Max Uses",
      "Expires",
      "Categories",
      "Max Per User",
      "First-time Only",
      "Created",
    ]

    const rows = filteredCoupons.map(coupon => [
      coupon.code,
      coupon.discountType,
      coupon.discountAmount,
      coupon.minPurchaseAmount,
      coupon.isActive ? "Active" : "Inactive",
      coupon.usedCount,
      coupon.maxUses || "Unlimited",
      new Date(coupon.expirationDate).toLocaleDateString(),
      coupon.applicableCategories?.join("; ") || "All",
      coupon.maxUsesPerUser || "Unlimited",
      coupon.isFirstTimeCustomerOnly ? "Yes" : "No",
      new Date(coupon.createdAt).toLocaleDateString(),
    ])

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `coupons-report-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredCoupons = coupons
    .filter(c => {
      if (filterActive === "active") return c.isActive
      if (filterActive === "inactive") return !c.isActive
      if (filterActive === "expired") return new Date(c.expirationDate) < new Date()
      return true
    })
    .filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
    expired: coupons.filter(c => new Date(c.expirationDate) < new Date()).length,
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-off-white">
        <StaffSidebar />
        <main className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-off-white">
      <StaffSidebar />
      <main className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-serif font-bold text-3xl">Coupon Report</h1>
              <p className="text-gray-600 mt-2">View all active and expired coupons</p>
            </div>
            <Button 
              onClick={exportToCSV}
              className="bg-coral hover:bg-red-600 text-white"
            >
              <Download size={20} className="mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Coupons</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Tag className="text-coral" size={40} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <TrendingUp className="text-green-600" size={40} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Usage</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsage}</p>
                </div>
                <Users className="text-blue-600" size={40} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Expired</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <Tag className="text-red-600" size={40} />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Search by code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterActive === "all" ? "default" : "outline"}
                  onClick={() => setFilterActive("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterActive === "active" ? "default" : "outline"}
                  onClick={() => setFilterActive("active")}
                >
                  Active
                </Button>
                <Button
                  variant={filterActive === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterActive("inactive")}
                >
                  Inactive
                </Button>
                <Button
                  variant={filterActive === "expired" ? "default" : "outline"}
                  onClick={() => setFilterActive("expired")}
                >
                  Expired
                </Button>
              </div>
            </div>
          </Card>

          {/* Coupons Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Min Purchase</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCoupons.map(coupon => {
                    const isExpired = new Date(coupon.expirationDate) < new Date()
                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{coupon.code}</div>
                          {coupon.isFirstTimeCustomerOnly && (
                            <span className="text-xs text-blue-600">First-time only</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountAmount}%`
                            : formatPeso(coupon.discountAmount)}
                        </td>
                        <td className="px-6 py-4">{formatPeso(coupon.minPurchaseAmount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-coral h-2 rounded-full"
                                style={{
                                  width: coupon.maxUses
                                    ? `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`
                                    : "0%",
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={isExpired ? "text-red-600" : ""}>
                            {new Date(coupon.expirationDate).toLocaleDateString()}
                          </div>
                          {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {coupon.applicableCategories.join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            isExpired
                              ? "bg-red-100 text-red-800"
                              : coupon.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {isExpired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredCoupons.length === 0 && (
              <div className="p-12 text-center">
                <Tag className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No coupons found</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
