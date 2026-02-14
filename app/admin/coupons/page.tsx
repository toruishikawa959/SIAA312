"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPeso } from "@/lib/currency"
import { Plus, Edit, Trash2, Search, Tag, TrendingUp, Users, DollarSign } from "lucide-react"

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
  updatedAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountAmount: 0,
    minPurchaseAmount: 0,
    expirationDate: "",
    isActive: true,
    maxUses: "",
    applicableCategories: "",
    maxUsesPerUser: "",
    isFirstTimeCustomerOnly: false,
  })

  useEffect(() => {
    fetchCoupons()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/books")
      const data = await res.json()
      if (data.success && data.books) {
        // Extract unique categories from books
        const uniqueCategories = [...new Set(data.books.map((book: any) => book.category).filter(Boolean))] as string[]
        setCategories(uniqueCategories.sort())
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      maxUsesPerUser: formData.maxUsesPerUser ? Number(formData.maxUsesPerUser) : undefined,
      applicableCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
    }

    try {
      if (editingCoupon) {
        // Update
        const res = await fetch("/api/admin/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCoupon._id, ...payload }),
        })
        const data = await res.json()
        if (data.success) {
          setCoupons(coupons.map(c => c._id === editingCoupon._id ? data.coupon : c))
        }
      } else {
        // Create
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          setCoupons([data.coupon, ...coupons])
        }
      }
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving coupon:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setCoupons(coupons.filter(c => c._id !== id))
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setSelectedCategories(coupon.applicableCategories || [])
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      minPurchaseAmount: coupon.minPurchaseAmount,
      expirationDate: coupon.expirationDate.split("T")[0],
      isActive: coupon.isActive,
      maxUses: coupon.maxUses?.toString() || "",
      applicableCategories: coupon.applicableCategories?.join(", ") || "",
      maxUsesPerUser: coupon.maxUsesPerUser?.toString() || "",
      isFirstTimeCustomerOnly: coupon.isFirstTimeCustomerOnly || false,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setSelectedCategories([])
    setFormData({
      code: "",
      discountType: "PERCENTAGE",
      discountAmount: 0,
      minPurchaseAmount: 0,
      expirationDate: "",
      isActive: true,
      maxUses: "",
      applicableCategories: "",
      maxUsesPerUser: "",
      isFirstTimeCustomerOnly: false,
    })
    setEditingCoupon(null)
  }

  const filteredCoupons = coupons
    .filter(c => {
      if (filterActive === "active") return c.isActive
      if (filterActive === "inactive") return !c.isActive
      return true
    })
    .filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => c.isActive).length,
    totalUsage: coupons.reduce((sum, c) => sum + c.usedCount, 0),
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-off-white">
        <AdminSidebar />
        <main className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
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
      <AdminSidebar />
      <main className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif font-bold text-3xl">Coupon Management</h1>
            <Button 
              onClick={() => { resetForm(); setShowModal(true) }}
              className="bg-coral hover:bg-red-600 text-white"
            >
              <Plus size={20} className="mr-2" />
              Create Coupon
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <p className="text-gray-600 text-sm">Active Coupons</p>
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
              </div>
            </div>
          </Card>

          {/* Coupons List */}
          <div className="space-y-4">
            {filteredCoupons.map(coupon => (
              <Card key={coupon._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl">{coupon.code}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        coupon.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                      {coupon.isFirstTimeCustomerOnly && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          First-time only
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountAmount}% off`
                        : `${formatPeso(coupon.discountAmount)} off`}
                      {" • "}
                      Min purchase: {formatPeso(coupon.minPurchaseAmount)}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Usage</p>
                        <p className="font-semibold">
                          {coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p className="font-semibold">
                          {new Date(coupon.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                      {coupon.applicableCategories && coupon.applicableCategories.length > 0 && (
                        <div>
                          <p className="text-gray-500">Categories</p>
                          <p className="font-semibold">{coupon.applicableCategories.join(", ")}</p>
                        </div>
                      )}
                      {coupon.maxUsesPerUser && (
                        <div>
                          <p className="text-gray-500">Max per user</p>
                          <p className="font-semibold">{coupon.maxUsesPerUser}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCoupons.length === 0 && (
            <Card className="p-12 text-center">
              <Tag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No coupons found</p>
            </Card>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="font-serif font-bold text-2xl mb-6">
                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                    disabled={!!editingCoupon}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Discount Type *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      aria-label="Discount Type"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Discount Amount *</label>
                    <Input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Min Purchase Amount</label>
                    <Input
                      type="number"
                      value={formData.minPurchaseAmount}
                      onChange={(e) => setFormData({ ...formData, minPurchaseAmount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Expiration Date *</label>
                    <Input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Uses (optional)</label>
                    <Input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Max Uses Per User (optional)</label>
                    <Input
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Applicable Categories (optional)</label>
                  <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                    {categories.length > 0 ? (
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, category])
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category))
                                }
                              }}
                              className="w-4 h-4 text-coral focus:ring-coral border-gray-300 rounded"
                            />
                            <span className="text-sm">{category}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No categories available</p>
                    )}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCategories.map((cat) => (
                        <span key={cat} className="bg-coral/10 text-coral px-3 py-1 rounded-full text-sm font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFirstTimeCustomerOnly}
                      onChange={(e) => setFormData({ ...formData, isFirstTimeCustomerOnly: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">First-time customers only</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-coral hover:bg-red-600 text-white">
                    {editingCoupon ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
