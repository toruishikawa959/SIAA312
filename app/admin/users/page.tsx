"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { Search, Edit2, X, Calendar, Loader, AlertCircle, Plus, Trash2, Lock, Unlock } from "lucide-react"

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: "customer" | "staff" | "admin"
  createdAt: string
  suspended?: boolean
}

interface CreateUserForm {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "customer" | "staff" | "admin"
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState("")
  const [newRole, setNewRole] = useState("")
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    type: "delete" | "suspend" | "reactivate" | null
    userId: string | null
    userName: string
  }>({
    show: false,
    type: null,
    userId: null,
    userName: "",
  })

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "customer",
  })

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
      handleCloseRoleModal()
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
      handleCloseRoleModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setSaveLoading(false)
    }
  }

  async function createNewUser() {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setSaveLoading(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create user")
      }

      const newUser = await response.json()
      setUsers((prev) => [newUser, ...prev])
      setCreateForm({ firstName: "", lastName: "", email: "", password: "", role: "customer" })
      setShowCreateModal(false)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleSuspendUser(userId: string, userName: string) {
    setConfirmDialog({
      show: true,
      type: "suspend",
      userId,
      userName,
    })
  }

  async function handleReactivateUser(userId: string, userName: string) {
    setConfirmDialog({
      show: true,
      type: "reactivate",
      userId,
      userName,
    })
  }

  async function handleDeleteUser(userId: string, userName: string) {
    setConfirmDialog({
      show: true,
      type: "delete",
      userId,
      userName,
    })
  }

  async function confirmAction() {
    if (!confirmDialog.userId || !confirmDialog.type) return

    try {
      setSaveLoading(true)

      if (confirmDialog.type === "delete") {
        const response = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete user")
        setUsers((prev) => prev.filter((user) => user._id !== confirmDialog.userId))
      } else if (confirmDialog.type === "suspend") {
        const response = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: true }),
        })
        if (!response.ok) throw new Error("Failed to suspend user")
        setUsers((prev) =>
          prev.map((user) =>
            user._id === confirmDialog.userId ? { ...user, suspended: true } : user
          )
        )
      } else if (confirmDialog.type === "reactivate") {
        const response = await fetch(`/api/admin/users/${confirmDialog.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspended: false }),
        })
        if (!response.ok) throw new Error("Failed to reactivate user")
        setUsers((prev) =>
          prev.map((user) =>
            user._id === confirmDialog.userId ? { ...user, suspended: false } : user
          )
        )
      }

      setConfirmDialog({ show: false, type: null, userId: null, userName: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete action")
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

  const handleOpenRoleModal = (user: User): void => {
    setEditingUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const handleCloseRoleModal = (): void => {
    setShowRoleModal(false)
    setEditingUser(null)
    setNewRole("")
  }

  const handleCloseCreateModal = (): void => {
    setShowCreateModal(false)
    setCreateForm({ firstName: "", lastName: "", email: "", password: "", role: "customer" })
    setError("")
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
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-serif text-4xl font-bold">User Management</h1>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gold hover:bg-yellow-500 text-charcoal font-semibold flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add User
                </Button>
              </div>
              <p className="text-gray-600 mb-8">Manage user roles, permissions, and accounts</p>

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
                  <Card
                    key={user._id}
                    className={`card-base p-6 hover:shadow-lg transition-shadow ${
                      user.suspended ? "opacity-60 bg-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-lg">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.suspended && (
                            <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                              <Lock size={12} />
                              Suspended
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                        <Badge className={`${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRoleModal(user)}
                        className="p-2 hover:bg-cream rounded-lg transition-colors"
                        title="Edit user role"
                        aria-label="Edit user role"
                      >
                        <Edit2 size={20} className="text-gold" />
                      </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {user.suspended ? (
                          <Button
                            onClick={() => handleReactivateUser(user._id, `${user.firstName} ${user.lastName}`)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-1 text-sm"
                          >
                            <Unlock size={16} />
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleSuspendUser(user._id, `${user.firstName} ${user.lastName}`)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-1 text-sm"
                          >
                            <Lock size={16} />
                            Suspend
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-1 text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
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
        {showRoleModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-base w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold">Edit User Role</h2>
                  <button
                    type="button"
                    onClick={handleCloseRoleModal}
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
                  <Button onClick={handleCloseRoleModal} className="btn-outline flex-1 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="card-base w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-bold">Add New User</h2>
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">First Name *</label>
                    <Input
                      type="text"
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Last Name *</label>
                    <Input
                      type="text"
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <Input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Password *</label>
                    <Input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full border-2 border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Role *</label>
                    <Select value={createForm.role} onValueChange={(role: any) => setCreateForm({ ...createForm, role })}>
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
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={createNewUser}
                    disabled={saveLoading}
                    className="btn-secondary flex-1 rounded-full"
                  >
                    {saveLoading ? (
                      <>
                        <Loader size={16} className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                  <Button onClick={handleCloseCreateModal} className="btn-outline flex-1 rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <Card className="card-base w-full max-w-sm">
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold mb-2">
                  {confirmDialog.type === "delete" && "Delete User?"}
                  {confirmDialog.type === "suspend" && "Suspend User?"}
                  {confirmDialog.type === "reactivate" && "Reactivate User?"}
                </h3>
                <p className="text-gray-700 mb-6">
                  {confirmDialog.type === "delete" && (
                    <>
                      Are you sure you want to delete <strong>{confirmDialog.userName}</strong>? This action cannot be
                      undone.
                    </>
                  )}
                  {confirmDialog.type === "suspend" && (
                    <>
                      Suspend <strong>{confirmDialog.userName}</strong>? They won't be able to log in or place orders.
                    </>
                  )}
                  {confirmDialog.type === "reactivate" && (
                    <>
                      Reactivate <strong>{confirmDialog.userName}</strong>? They will be able to log in again.
                    </>
                  )}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setConfirmDialog({ show: false, type: null, userId: null, userName: "" })}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-charcoal font-semibold"
                    disabled={saveLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmAction}
                    disabled={saveLoading}
                    className={`flex-1 text-white font-semibold flex items-center justify-center gap-2 ${
                      confirmDialog.type === "delete"
                        ? "bg-red-500 hover:bg-red-600"
                        : confirmDialog.type === "suspend"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {saveLoading && <Loader size={16} className="animate-spin" />}
                    {confirmDialog.type === "delete" && "Delete User"}
                    {confirmDialog.type === "suspend" && "Suspend User"}
                    {confirmDialog.type === "reactivate" && "Reactivate User"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </>
    </ProtectedRoute>
  )
}
