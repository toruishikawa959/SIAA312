"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DevNavigation } from "@/components/dev-navigation"
import { Database, RefreshCw, Download, Upload, Trash2, AlertCircle, CheckCircle, Loader } from "lucide-react"

interface DatabaseStats {
  books: number
  users: number
  orders: number
  addresses: number
  carts: number
  newsletters: number
  coupons: number
}

export default function DevDatabasePage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dev/database/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setError("")
      } else {
        setError(data.error || "Failed to fetch stats")
      }
    } catch (err) {
      setError("Error fetching database stats")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, endpoint: string) => {
    if (action === "clear" && !confirm("Are you sure you want to clear all data? This cannot be undone!")) {
      return
    }

    try {
      setActionLoading(action)
      setActionSuccess(null)
      const res = await fetch(endpoint, { method: "POST" })
      const data = await res.json()
      
      if (data.success) {
        setActionSuccess(action)
        setTimeout(() => setActionSuccess(null), 3000)
        await fetchStats() // Refresh stats
      } else {
        alert(data.error || `Failed to ${action}`)
      }
    } catch (err) {
      alert(`Error: ${err}`)
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <>
        <DevNavigation />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-64"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const collections = [
    { name: "Books", key: "books", icon: "📚", color: "bg-blue-100 text-blue-800" },
    { name: "Users", key: "users", icon: "👥", color: "bg-green-100 text-green-800" },
    { name: "Orders", key: "orders", icon: "📦", color: "bg-purple-100 text-purple-800" },
    { name: "Addresses", key: "addresses", icon: "📍", color: "bg-orange-100 text-orange-800" },
    { name: "Carts", key: "carts", icon: "🛒", color: "bg-yellow-100 text-yellow-800" },
    { name: "Newsletters", key: "newsletters", icon: "📧", color: "bg-pink-100 text-pink-800" },
    { name: "Coupons", key: "coupons", icon: "🎟️", color: "bg-indigo-100 text-indigo-800" },
  ]

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
              <Database size={32} />
              🔧 DEV MODE - Database Management
            </h1>
            <p className="text-gray-600">⚠️ Database operations and statistics. FOR DEVELOPMENT ONLY!</p>
          </div>

          {error && (
            <Card className="p-4 bg-red-50 border-l-4 border-red-500 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800">{error}</p>
              </div>
            </Card>
          )}

          {actionSuccess && (
            <Card className="p-4 bg-green-50 border-l-4 border-green-500 mb-6">
              <div className="flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-green-800">Action completed successfully!</p>
              </div>
            </Card>
          )}

          {/* Collection Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Collection Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {collections.map((collection) => (
                <Card key={collection.key} className="p-6 text-center">
                  <div className="text-4xl mb-2">{collection.icon}</div>
                  <h3 className="font-semibold text-gray-700 mb-1">{collection.name}</h3>
                  <p className={`text-3xl font-bold ${collection.color} inline-block px-4 py-2 rounded-lg`}>
                    {stats ? (stats as any)[collection.key].toLocaleString() : 0}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Database Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Backup & Export */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Download size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold">Backup & Export</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Export all database collections to JSON files
              </p>
              <Button
                onClick={() => handleAction("export", "/api/dev/database/export")}
                disabled={actionLoading === "export"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading === "export" ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Export Database
                  </>
                )}
              </Button>
            </Card>

            {/* Refresh Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw size={24} className="text-green-600" />
                <h2 className="text-xl font-bold">Refresh Stats</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Reload database statistics and collection counts
              </p>
              <Button
                onClick={fetchStats}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Now
                  </>
                )}
              </Button>
            </Card>

            {/* Import Data */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={24} className="text-purple-600" />
                <h2 className="text-xl font-bold">Import Data</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Import JSON data files into database collections
              </p>
              <Button
                onClick={() => handleAction("import", "/api/dev/database/import")}
                disabled={actionLoading === "import"}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {actionLoading === "import" ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Import JSON Files
                  </>
                )}
              </Button>
            </Card>

            {/* Clear All Data */}
            <Card className="p-6 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 size={24} className="text-red-600" />
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                ⚠️ Clear all data from all collections (irreversible!)
              </p>
              <Button
                onClick={() => handleAction("clear", "/api/dev/database/clear")}
                disabled={actionLoading === "clear"}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {actionLoading === "clear" ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Clear All Data
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Connection Info */}
          <Card className="p-6 mt-6 bg-gray-100">
            <h3 className="font-bold mb-2">Database Connection</h3>
            <p className="text-sm text-gray-600 font-mono">
              MongoDB Atlas - bookstore.umqddpx.mongodb.net
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}
