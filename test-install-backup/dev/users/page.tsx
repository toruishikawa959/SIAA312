"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DevNavigation } from "@/components/dev-navigation"
import { Eye, EyeOff, Copy, Check, Key, Search } from "lucide-react"

interface User {
  _id: string
  email: string
  password: string
  name: string
  role: string
  createdAt: string
}

export default function DevUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})
  const [resetting, setResetting] = useState<{ [key: string]: boolean }>({})
  const [newPasswords, setNewPasswords] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/dev/users")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePassword = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  const copyToClipboard = (text: string, userId: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [`${userId}-${field}`]: true }))
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [`${userId}-${field}`]: false }))
    }, 2000)
  }

  const resetPassword = async (userId: string, email: string) => {
    const newPassword = newPasswords[userId]
    if (!newPassword) {
      alert("Please enter a new password")
      return
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      const res = await fetch("/api/dev/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`✅ Password reset for ${email}!\n\nNew password: ${newPassword}`)
        setNewPasswords(prev => ({ ...prev, [userId]: "" }))
        setResetting(prev => ({ ...prev, [userId]: false }))
      } else {
        alert("Failed to reset password")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      alert("Error resetting password")
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

  return (
    <>
      <DevNavigation />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">🔧 DEV MODE - All Users</h1>
            <p className="text-gray-600">⚠️ This page shows password hashes. FOR DEVELOPMENT ONLY!</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-600 mt-2">
                Found {users.filter(user => 
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.role.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} user(s)
              </p>
            )}
          </div>

        <div className="space-y-4">
          {users
            .filter(user => 
              user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((user) => (
            <Card key={user._id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      user.role === "admin" ? "bg-red-100 text-red-800" :
                      user.role === "staff" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    <p className="font-mono text-xs">{user._id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Email</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.email, user._id, 'email')}
                        className="h-6 px-2"
                      >
                        {copied[`${user._id}-email`] ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </div>
                    <p className="font-mono text-sm break-all">{user.email}</p>
                  </div>

                  {/* Password */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Password (Hashed)</label>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePassword(user._id)}
                          className="h-6 px-2"
                        >
                          {showPasswords[user._id] ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user.password, user._id, 'password')}
                          className="h-6 px-2"
                        >
                          {copied[`${user._id}-password`] ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="font-mono text-xs break-all text-gray-500">
                      {showPasswords[user._id] ? user.password : "••••••••••••"}
                    </p>
                    {/* Default passwords for seeded users */}
                    {user.email === "admin@sierbosten.com" && (
                      <p className="mt-2 text-sm font-semibold text-green-600">
                        🔑 Default: admin123
                      </p>
                    )}
                    {user.email === "staff@sierbosten.com" && (
                      <p className="mt-2 text-sm font-semibold text-green-600">
                        🔑 Default: staff123
                      </p>
                    )}
                    {user.email === "customer@example.com" && (
                      <p className="mt-2 text-sm font-semibold text-green-600">
                        🔑 Default: customer123
                      </p>
                    )}
                    {!["admin@sierbosten.com", "staff@sierbosten.com", "customer@example.com"].includes(user.email) && (
                      <p className="mt-2 text-xs text-orange-600">
                        ⚠️ User-registered (password unknown)
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Reset */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={16} className="text-yellow-700" />
                    <p className="text-sm font-semibold text-yellow-800">Reset Password</p>
                  </div>
                  
                  {resetting[user._id] ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter new password"
                        value={newPasswords[user._id] || ""}
                        onChange={(e) => setNewPasswords(prev => ({ ...prev, [user._id]: e.target.value }))}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resetPassword(user._id, user.email)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setResetting(prev => ({ ...prev, [user._id]: false }))
                            setNewPasswords(prev => ({ ...prev, [user._id]: "" }))
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setResetting(prev => ({ ...prev, [user._id]: true }))}
                      className="text-xs"
                    >
                      Set New Password
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No users found</p>
          </Card>
        )}
      </div>
    </div>
    </>
  )
}
