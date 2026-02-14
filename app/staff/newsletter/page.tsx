"use client"

import { useEffect, useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Search, Download, Users, UserCheck, UserX } from "lucide-react"

interface Subscriber {
  _id: string
  email: string
  active: boolean
  subscribedAt: Date
  resubscribedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface Stats {
  total: number
  active: number
  inactive: number
}

export default function StaffNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSubscribers()
  }, [filter])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/newsletter?status=${filter}`)
      const data = await response.json()
      
      if (response.ok) {
        setSubscribers(data.subscribers)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Email", "Status", "Subscribed At", "Last Updated"],
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.active ? "Active" : "Inactive",
        new Date(sub.subscribedAt).toLocaleString(),
        new Date(sub.updatedAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <StaffSidebar />
        <main className="flex-1 md:ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="h-10 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 h-32 bg-gray-100 animate-pulse"></Card>
              ))}
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar />

      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl font-bold">Newsletter Subscribers</h1>
            <Button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
              <Download size={20} />
              Export CSV
            </Button>
          </div>

          {/* Info Banner */}
          <Card className="p-4 mb-6 bg-blue-50 border-l-4 border-blue-500">
            <p className="text-blue-800 text-sm">
              <strong>Staff View:</strong> You can view newsletter subscribers but cannot modify or delete them. 
              Contact an administrator for subscription management.
            </p>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-white border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <Users className="text-blue-500" size={40} />
              </div>
            </Card>

            <Card className="p-6 bg-white border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                </div>
                <UserCheck className="text-green-500" size={40} />
              </div>
            </Card>

            <Card className="p-6 bg-white border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Inactive Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
                </div>
                <UserX className="text-red-500" size={40} />
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "btn-primary" : "btn-outline"}
                >
                  All ({stats.total})
                </Button>
                <Button
                  onClick={() => setFilter("active")}
                  className={filter === "active" ? "btn-primary" : "btn-outline"}
                >
                  Active ({stats.active})
                </Button>
                <Button
                  onClick={() => setFilter("inactive")}
                  className={filter === "inactive" ? "btn-primary" : "btn-outline"}
                >
                  Inactive ({stats.inactive})
                </Button>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Subscribers List */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscribed At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        {searchQuery ? "No subscribers found matching your search" : "No subscribers yet"}
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="font-medium">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {subscriber.active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {new Date(subscriber.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {filteredSubscribers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
