"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { Search, Edit2, X, Calendar, Loader, AlertCircle } from "lucide-react"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "customer" | "staff" | "admin"
  createdAt: string
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState("")
  const [newRole, setNewRole] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.users || [])
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole() {
    if (!editingUser || newRole === editingUser.role) {
      handleCloseModal()
      return
    }

    try {
      setSaveLoading(true)
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      setUsers((prev) =>
        prev.map((user) =>
          user._id === editingUser._id
            ? { ...user, role: newRole as "customer" | "staff" | "admin" }
            : user
        )
      )
      handleCloseModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setSaveLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleOpenModal = (user: User): void => {
    setEditingUser(user)
    setNewRole(user.role)
    setShowModal(true)
  }

  const handleCloseModal = (): void => {
    setShowModal(false)
    setEditingUser(null)
    setNewRole("")
  }

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <main className="min-h-screen bg-off-white md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size={48} className="text-gold animate-spin" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <>
        <AdminSidebar />

        <main className="min-h-screen bg-off-white md:ml-64">
          <section className="py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="font-serif text-4xl font-bold mb-2">User Management</h1>
              <p className="text-gray-600 mb-8">Manage user roles and permissions</p>

              {error && (
                <Card className="card-base p-4 bg-red-50 border-l-4 border-red-500 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-red-800">{error}</p>
                  </div>
                </Card>
              )}

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-full border-2 border-gray-300 focus:border-gold"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="rounded-full border-2 border-gray-300">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <Card key={user._id} className="card-base p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-serif font-bold text-lg mb-1">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                        <Badge className={`${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(user)}
                        className="p-2 hover:bg-cream rounded-lg transition-colors"
                        title="Edit user role"
                        aria-label="Edit user role"
                      >
                        <Edit2 size={20} className="text-gold" />
                      </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No users found matching your search.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Edit Role Modal */}
        {showModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-base w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold">Edit User Role</h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">User</p>
                    <p className="font-semibold">
                      {editingUser.firstName} {editingUser.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{editingUser.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Role</label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newRole !== editingUser.role && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        You are changing this user's role from <strong>{editingUser.role}</strong> to{" "}
                        <strong>{newRole}</strong>.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={updateUserRole}
                    disabled={saveLoading}
                    className="btn-secondary flex-1 rounded-full"
                  >
                    {saveLoading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button onClick={handleCloseModal} className="btn-outline flex-1 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Footer />
      </>
    </ProtectedRoute>
  )
}
