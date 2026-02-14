"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Loader, Trash2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with Leaflet
const AddressMap = dynamic(() => import("@/components/address-map").then(mod => ({ default: mod.AddressMap })), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

interface Address {
  _id: string
  label: string
  fullAddress: string
  phone: string
  latitude: number
  longitude: number
  details?: string
  isDefault?: boolean
}

interface AddressFormProps {
  userId: string
  onAddressSelect: (address: Address) => void
  onAddressAdded?: () => void
}

export function AddressForm({ userId, onAddressSelect, onAddressAdded }: AddressFormProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [formData, setFormData] = useState({
    label: "Home",
    fullAddress: "",
    phone: "",
    details: "",
    latitude: 0,
    longitude: 0,
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch saved addresses
  useEffect(() => {
    fetchAddresses()
    getLocationButton()
  }, [userId])

  async function fetchAddresses() {
    try {
      setLoading(true)
      const response = await fetch(`/api/addresses?userId=${userId}`)
      const data = await response.json()
      setAddresses(data.addresses || [])

      // Auto-select first address or default
      if (data.addresses?.length > 0) {
        const defaultAddr = data.addresses.find((a: Address) => a.isDefault)
        if (defaultAddr) {
          onAddressSelect(defaultAddr)
        }
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get current location using Geolocation API
  function getLocationButton() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }))
          reverseGeocode(latitude, longitude)
        },
        (error) => {
          console.warn("Geolocation denied:", error)
          // Default to Manila, Philippines
          setCurrentLocation({ lat: 14.5995, lng: 120.9842 })
          setFormData((prev) => ({
            ...prev,
            latitude: 14.5995,
            longitude: 120.9842,
          }))
        }
      )
    }
  }

  // Reverse geocode coordinates to address
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setFormData((prev) => ({
        ...prev,
        fullAddress: address,
      }))
    } catch (err) {
      console.error("Geocoding error:", err)
    }
  }

  // Handle map location change
  function handleLocationChange(lat: number, lng: number, address: string) {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      fullAddress: address,
    }))
  }

  // Submit address form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (!formData.fullAddress || !formData.phone) {
        setError("Address and phone number are required")
        return
      }

      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save address")
      }

      const data = await response.json()
      setShowForm(false)
      setFormData({
        label: "Home",
        fullAddress: "",
        phone: "",
        details: "",
        latitude: 0,
        longitude: 0,
      })
      onAddressSelect(data.address)
      onAddressAdded?.()
      await fetchAddresses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address")
    } finally {
      setSubmitting(false)
    }
  }

  // Delete address
  async function handleDelete(addressId: string) {
    if (!confirm("Delete this address?")) return

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      await fetchAddresses()
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address")
    }
  }

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">My Addresses</h3>
          <div className="grid gap-3">
            {addresses.map((address) => (
              <Card
                key={address._id}
                className="p-4 cursor-pointer hover:border-gold transition"
                onClick={() => onAddressSelect(address)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{address.label}</h4>
                      {address.isDefault && (
                        <Badge className="bg-gold text-charcoal">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.fullAddress}</p>
                    {address.details && (
                      <p className="text-xs text-gray-500 mb-1">{address.details}</p>
                    )}
                    <p className="text-sm font-semibold">{address.phone}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(address._id)
                    }}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete address"
                    aria-label="Delete address"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Address Form */}
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-gold text-charcoal hover:bg-gold/90"
        >
          <MapPin size={18} className="mr-2" />
          Add New Address
        </Button>
      ) : (
        <Card className="p-6 bg-gray-50 border-2 border-gold/30">
          <h3 className="font-semibold text-lg mb-4">Add Delivery Address</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded flex gap-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Label */}
            <div>
              <label htmlFor="address-label" className="block text-sm font-semibold mb-2">Address Label</label>
              <select
                id="address-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number *</label>
              <Input
                type="tel"
                placeholder="+639123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300"
                required
              />
            </div>

            {/* Map for Location Selection */}
            {currentLocation && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">📍 Delivery Location</label>
                  <p className="text-xs text-gray-600 mb-2">
                    Click on the map or drag the marker to set your delivery location
                  </p>
                  <AddressMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                    zoom={15}
                    editable={true}
                  />
                </div>
              </>
            )}

            {/* Full Address */}
            <div>
              <label className="block text-sm font-semibold mb-2">Full Address *</label>
              <Input
                type="text"
                placeholder="123 Main Street, Manila, Philippines"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                className="border-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Additional Details (Optional)
              </label>
              <Input
                type="text"
                placeholder="Unit 201, Building A, Gate Code: 1234"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="border-gray-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gold text-charcoal hover:bg-gold/90"
              >
                {submitting ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MapPin size={18} className="mr-2" />
                    Save Address
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
