"use client"

import { useEffect, useState } from "react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, ToggleLeft, ToggleRight, Search, Download, Users, UserCheck, UserX, Send } from "lucide-react"

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

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({
    subject: "",
    message: "",
    recipientType: "active" as "all" | "active" | "inactive",
  })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

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

  const handleToggleStatus = async (email: string, currentStatus: boolean) => {
    try {
      setActionLoading(email)
      const response = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, active: !currentStatus }),
      })

      if (response.ok) {
        await fetchSubscribers()
      } else {
        alert("Failed to update subscriber status")
      }
    } catch (error) {
      console.error("Error updating subscriber:", error)
      alert("Error updating subscriber status")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber: ${email}?`)) {
      return
    }

    try {
      setActionLoading(email)
      const response = await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        await fetchSubscribers()
      } else {
        alert("Failed to delete subscriber")
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      alert("Error deleting subscriber")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      setEmailStatus({ type: "error", message: "Subject and message are required" })
      return
    }

    const recipientCount = emailForm.recipientType === "all" ? stats.total : 
                          emailForm.recipientType === "active" ? stats.active : stats.inactive

    if (recipientCount === 0) {
      setEmailStatus({ type: "error", message: "No subscribers to send to" })
      return
    }

    if (!confirm(`Send this newsletter to ${recipientCount} ${emailForm.recipientType} subscriber(s)?`)) {
      return
    }

    try {
      setSendingEmail(true)
      setEmailStatus(null)

      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailStatus({ 
          type: "success", 
          message: `Newsletter sent successfully to ${data.recipientCount} subscriber(s)!` 
        })
        setEmailForm({ subject: "", message: "", recipientType: "active" })
        setTimeout(() => {
          setShowEmailModal(false)
          setEmailStatus(null)
        }, 2000)
      } else {
        setEmailStatus({ type: "error", message: data.error || "Failed to send newsletter" })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      setEmailStatus({ type: "error", message: "Failed to send newsletter" })
    } finally {
      setSendingEmail(false)
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
      <>
        <AdminNavigation userType="admin" />
        <main className="min-h-screen bg-gray-50 p-8">
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
      </>
    )
  }

  return (
    <>
      <AdminNavigation userType="admin" />

      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-4xl font-bold">Newsletter Management</h1>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowEmailModal(true)} 
                className="bg-coral hover:bg-red-600 text-white flex items-center gap-2"
              >
                <Send size={20} />
                Send Newsletter
              </Button>
              <Button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
                <Download size={20} />
                Export CSV
              </Button>
            </div>
          </div>

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
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
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
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleStatus(subscriber.email, subscriber.active)}
                              disabled={actionLoading === subscriber.email}
                              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                              title={subscriber.active ? "Deactivate" : "Activate"}
                            >
                              {subscriber.active ? (
                                <ToggleRight className="text-green-600" size={20} />
                              ) : (
                                <ToggleLeft className="text-gray-400" size={20} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(subscriber.email)}
                              disabled={actionLoading === subscriber.email}
                              className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 disabled:opacity-50"
                              title="Delete subscriber"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
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

      {/* Email Composer Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif font-bold text-2xl flex items-center gap-2">
                <Send size={24} />
                Compose Newsletter
              </h2>
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setEmailStatus(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendNewsletter} className="space-y-4">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">Send to:</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="active"
                      checked={emailForm.recipientType === "active"}
                      onChange={(e) => setEmailForm({ ...emailForm, recipientType: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Active Subscribers ({stats.active})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="all"
                      checked={emailForm.recipientType === "all"}
                      onChange={(e) => setEmailForm({ ...emailForm, recipientType: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      All Subscribers ({stats.total})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="inactive"
                      checked={emailForm.recipientType === "inactive"}
                      onChange={(e) => setEmailForm({ ...emailForm, recipientType: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      Inactive Subscribers ({stats.inactive})
                    </span>
                  </label>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold mb-2">Subject *</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                  required
                  disabled={sendingEmail}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Enter your newsletter message..."
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent resize-none"
                  required
                  disabled={sendingEmail}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use line breaks to format your message. Keep it concise and engaging!
                </p>
              </div>

              {/* Status Messages */}
              {emailStatus && (
                <div className={`p-4 rounded-lg ${
                  emailStatus.type === "success" 
                    ? "bg-green-50 border border-green-200 text-green-800" 
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {emailStatus.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 bg-coral text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Newsletter
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailModal(false)
                    setEmailStatus(null)
                  }}
                  disabled={sendingEmail}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>

              {/* Note about email service */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Currently in development mode. Emails are logged to console. 
                  To send real emails, integrate with SendGrid, AWS SES, Mailgun, or similar service.
                </p>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}
