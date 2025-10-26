"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, MapPin, Calendar, AlertCircle, CheckCircle, Edit2, Save, X, Loader, Home, Trash2, Check } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface UserProfile {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  birthDate?: string
  createdAt: string
}

interface Address {
  _id: string
  userId: string
  label: string
  fullAddress: string
  phone: string
  latitude: number
  longitude: number
  details?: string
  isDefault: boolean
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  
  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressFormData, setAddressFormData] = useState({
    label: "",
    fullAddress: "",
    phone: "",
    details: "",
    isDefault: false
  })
  const [isDeletingAddress, setIsDeletingAddress] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/login")
        return
      }

      try {
        const userData = JSON.parse(storedUser)
        const response = await fetch(`/api/users/${userData._id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const profileData = await response.json()
        setUser(profileData)
        setFormData(profileData)

        const addressResponse = await fetch(`/api/addresses?userId=${userData._id}`)
        if (addressResponse.ok) {
          const addressData = await addressResponse.json()
          setAddresses(addressData.addresses || [])
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setAddressFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setAddressFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      setFormData(updatedUser)
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile. Please try again.")
      console.error("Error saving profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(user || {})
    setIsEditing(false)
    setError("")
  }

  const handleAddAddress = () => {
    setEditingAddressId(null)
    setAddressFormData({
      label: "",
      fullAddress: "",
      phone: "",
      details: "",
      isDefault: false
    })
    setShowAddressModal(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address._id)
    setAddressFormData({
      label: address.label,
      fullAddress: address.fullAddress,
      phone: address.phone,
      details: address.details || "",
      isDefault: address.isDefault
    })
    setShowAddressModal(true)
  }

  const handleSaveAddress = async () => {
    if (!addressFormData.label || !addressFormData.fullAddress || !addressFormData.phone) {
      setError("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      const url = editingAddressId ? `/api/addresses/${editingAddressId}` : "/api/addresses"
      const method = editingAddressId ? "PUT" : "POST"
      
      const payload = {
        ...addressFormData,
        userId: user?._id,
        latitude: 0,
        longitude: 0
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error("Failed to save address")
      }

      const addressResponse = await fetch(`/api/addresses?userId=${user?._id}`)
      if (addressResponse.ok) {
        const addressData = await addressResponse.json()
        setAddresses(addressData.addresses || [])
      }

      setShowAddressModal(false)
      setSuccess("Address saved successfully!")
    } catch (err) {
      setError("Failed to save address")
      console.error("Error saving address:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    setIsDeletingAddress(addressId)
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Failed to delete address")
      }

      setAddresses(prev => prev.filter(a => a._id !== addressId))
      setSuccess("Address deleted successfully!")
    } catch (err) {
      setError("Failed to delete address")
      console.error("Error deleting address:", err)
    } finally {
      setIsDeletingAddress(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true })
      })

      if (!response.ok) {
        throw new Error("Failed to set default")
      }

      const addressResponse = await fetch(`/api/addresses?userId=${user?._id}`)
      if (addressResponse.ok) {
        const addressData = await addressResponse.json()
        setAddresses(addressData.addresses || [])
      }

      setSuccess("Default address updated!")
    } catch (err) {
      setError("Failed to update default address")
      console.error("Error:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-gray-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 pt-16">
          <Loader size={48} className="text-gold animate-spin" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-gray-900 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-300 mb-4">Profile not found</p>
            <Link href="/">
              <Button className="bg-gold hover:bg-gold/90 text-charcoal">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-700">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gold text-charcoal p-3 rounded-lg">
                  <User size={24} />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">
                    {isEditing ? "Edit Profile" : `${formData.firstName} ${formData.lastName}`}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {isEditing ? "Update your personal information" : "Your account details"}
                  </CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gold/20 hover:bg-gold/30 text-gold border border-gold/50"
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={20} className="text-gold" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">First Name</label>
                  {isEditing ? (
                    <Input
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Last Name</label>
                  {isEditing ? (
                    <Input
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <p className="text-white bg-gray-700 rounded-lg px-3 py-2">{user.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Birth Date
                </label>
                {isEditing ? (
                  <Input
                    name="birthDate"
                    type="date"
                    value={formData.birthDate ? formData.birthDate.split('T')[0] : ""}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "Not set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  />
                ) : (
                  <p className="text-white bg-gray-700 rounded-lg px-3 py-2">
                    {user.phone || "Not set"}
                  </p>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Member Since</label>
                <p className="text-white bg-gray-700 rounded-lg px-3 py-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 border-t border-gray-700 pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gold hover:bg-gold/90 text-charcoal font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Addresses Section */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gold text-charcoal p-3 rounded-lg">
                  <Home size={24} />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">My Addresses</CardTitle>
                  <CardDescription className="text-gray-400">Manage your delivery addresses</CardDescription>
                </div>
              </div>
              <Button
                onClick={handleAddAddress}
                className="bg-gold hover:bg-gold/90 text-charcoal font-semibold"
              >
                <MapPin size={16} className="mr-2" />
                Add Address
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {addresses.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No addresses added yet. Add one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          {address.label}
                          {address.isDefault && (
                            <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded">Default</span>
                          )}
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id)}
                            title="Set as default"
                            className="p-1 hover:bg-gold/20 rounded text-gold"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(address)}
                          title="Edit address"
                          className="p-1 hover:bg-gold/20 rounded text-gold"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          disabled={isDeletingAddress === address._id}
                          title="Delete address"
                          className="p-1 hover:bg-coral/20 rounded text-coral disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-300">
                      <p>{address.fullAddress}</p>
                      <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {address.phone}
                      </p>
                      {address.details && <p className="text-gray-500">{address.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Label *</label>
                  <Input
                    name="label"
                    placeholder="e.g., Home, Work"
                    value={addressFormData.label}
                    onChange={handleAddressInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Address *</label>
                  <textarea
                    name="fullAddress"
                    placeholder="Enter complete address"
                    value={addressFormData.fullAddress}
                    onChange={handleAddressInputChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 placeholder:text-gray-500 focus:outline-none focus:border-gold"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Phone *</label>
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={addressFormData.phone}
                    onChange={handleAddressInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Details</label>
                  <Input
                    name="details"
                    placeholder="e.g., Gate code, floor number (optional)"
                    value={addressFormData.details}
                    onChange={handleAddressInputChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressInputChange}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-300">Set as default address</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveAddress}
                    disabled={isSaving}
                    className="flex-1 bg-gold hover:bg-gold/90 text-charcoal font-semibold"
                  >
                    {isSaving ? "Saving..." : "Save Address"}
                  </Button>
                  <Button
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/orders">
            <Card className="bg-gray-800 border-gray-700 hover:border-gold/50 cursor-pointer transition-all">
              <CardContent className="pt-6">
                <p className="text-white font-semibold mb-2">My Orders</p>
                <p className="text-sm text-gray-400">View and track your orders</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cart">
            <Card className="bg-gray-800 border-gray-700 hover:border-gold/50 cursor-pointer transition-all">
              <CardContent className="pt-6">
                <p className="text-white font-semibold mb-2">Shopping Cart</p>
                <p className="text-sm text-gray-400">Continue your shopping</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
    </>
  )
}
