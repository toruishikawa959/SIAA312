"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { AlertCircle, Trash2, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function DataManagement() {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const collections = [
    { name: "Books", id: "books", description: "Product catalog" },
    { name: "Carts", id: "carts", description: "Shopping carts" },
    { name: "Orders", id: "orders", description: "Customer orders" },
    { name: "Inventory Logs", id: "inventoryLogs", description: "Stock history" },
  ]

  const handleTruncateData = async () => {
    if (!confirmed) {
      setError("Please confirm the action first")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/truncate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collections: collections.map(c => c.id),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to truncate data")
      }

      setSuccess(data.message || "Data truncated successfully!")
      setConfirmed(false)
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <Navigation />

        <main className="min-h-screen bg-off-white py-12 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/admin/dashboard" className="text-gold hover:text-yellow-500 text-sm mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="font-serif text-3xl font-bold mb-2">Data Management</h1>
            <p className="text-gray-600">Manage and clean up system data</p>
          </div>

          {/* Warning Alert */}
          <Card className="card-base mb-6 p-4 border-l-4 border-red-500 bg-red-50">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Destructive Action</h3>
                <p className="text-red-700 text-sm">
                  This will permanently delete all data in the selected collections. User accounts will be preserved.
                </p>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="card-base mb-6 p-4 border-l-4 border-coral bg-red-50">
              <p className="text-red-800 text-sm">{error}</p>
            </Card>
          )}

          {/* Success Message */}
          {success && (
            <Card className="card-base mb-6 p-4 border-l-4 border-green-500 bg-green-50">
              <p className="text-green-800 text-sm font-semibold">{success}</p>
            </Card>
          )}

          {/* Data Collections Overview */}
          <Card className="card-base mb-6 p-6">
            <h2 className="font-semibold text-lg mb-4">Collections to Truncate</h2>
            <div className="space-y-3">
              {collections.map(collection => (
                <div key={collection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{collection.name}</p>
                      <p className="text-xs text-gray-500">{collection.description}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    Will be deleted
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Preserved Data */}
          <Card className="card-base mb-6 p-6 border-l-4 border-green-500">
            <h2 className="font-semibold text-lg mb-3 text-green-800">Preserved Data</h2>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
              <RotateCcw size={18} className="text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Users Collection</p>
                <p className="text-xs text-gray-500">All user accounts and authentication data will be kept intact</p>
              </div>
            </div>
          </Card>

          {/* Confirmation Checkbox */}
          <Card className="card-base mb-6 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 cursor-pointer"
              />
              <div>
                <p className="font-medium text-gray-900">
                  I understand this action is permanent and cannot be undone
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  I confirm that I want to delete all books, carts, orders, and inventory logs while preserving user accounts.
                </p>
              </div>
            </label>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleTruncateData}
              disabled={!confirmed || loading}
              className="btn-secondary bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
            >
              {loading ? "Processing..." : "Truncate All Data"}
            </Button>
            <Link href="/admin/dashboard" className="flex-1">
              <Button className="btn-primary w-full">Cancel</Button>
            </Link>
          </div>

          {/* Info Section */}
          <Card className="card-base mt-8 p-6 bg-blue-50">
            <h3 className="font-semibold mb-3 text-blue-900">What gets deleted?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ All books from the catalog</li>
              <li>✓ All shopping carts</li>
              <li>✓ All orders and order history</li>
              <li>✓ All inventory logs</li>
              <li>✗ User accounts remain untouched</li>
              <li>✗ Authentication data is preserved</li>
            </ul>
          </Card>
        </div>
      </main>
      </>
    </ProtectedRoute>
  )
}
