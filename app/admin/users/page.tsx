"use client"

import { useState } from "react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Edit2, X, Calendar, DollarSign, Package } from "lucide-react"

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "customer",
      registeredDate: "2024-12-01",
      orders: 5,
      totalSpent: 127.45,
    },
    {
      id: 2,
      name: "John Smith",
      email: "john@example.com",
      role: "staff",
      registeredDate: "2024-11-15",
      orders: 0,
      totalSpent: 0,
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma@example.com",
      role: "customer",
      registeredDate: "2024-10-20",
      orders: 3,
      totalSpent: 89.97,
    },
    {
      id: 4,
      name: "Michael Brown",
      email: "michael@example.com",
      role: "admin",
      registeredDate: "2024-09-10",
      orders: 0,
      totalSpent: 0,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      email: "lisa@example.com",
      role: "customer",
      registeredDate: "2024-08-05",
      orders: 8,
      totalSpent: 234.56,
    },
    {
      id: 6,
      name: "David Wilson",
      email: "david@example.com",
      role: "staff",
      registeredDate: "2024-07-12",
      orders: 0,
      totalSpent: 0,
    },
  ])

  const [newRole, setNewRole] = useState("")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role) => {
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

  const handleOpenModal = (user) => {
    setEditingUser(user)
    setNewRole(user.role)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setNewRole("")
  }

  const handleSaveRole = () => {
    if (editingUser && newRole !== editingUser.role) {
      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, role: newRole } : user)))
    }
    handleCloseModal()
  }

  return (
    <>
      <AdminNavigation userType="admin" />

      <main className="min-h-screen bg-off-white">
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-serif text-4xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600 mb-8">Manage user roles and permissions</p>

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
                <Card key={user.id} className="card-base p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-serif font-bold text-lg mb-1">{user.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{user.email}</p>
                      <Badge className={`${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="p-2 hover:bg-cream rounded-lg transition-colors"
                    >
                      <Edit2 size={20} className="text-gold" />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>Joined {new Date(user.registeredDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={16} />
                      <span>
                        {user.orders} order{user.orders !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span>${user.totalSpent.toFixed(2)} spent</span>
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
                <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">User</p>
                  <p className="font-semibold">{editingUser.name}</p>
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
                <Button onClick={handleSaveRole} className="btn-secondary flex-1 rounded-full">
                  Save Changes
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
  )
}
