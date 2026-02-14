"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle, CheckCircle, MapPin, Phone, MapIcon, Eye, EyeOff } from "lucide-react"
import { getGuestCartForMerge, clearGuestCart } from "@/lib/guest-cart"
import { AddressSearch } from "@/components/address-search"
import dynamic from "next/dynamic"

const AddressMap = dynamic(() => import("@/components/address-map").then(mod => ({ default: mod.AddressMap })), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>,
})

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" })
  const [addressData, setAddressData] = useState({ phone: "", fullAddress: "", details: "", latitude: 14.5995, longitude: 120.9842 })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if ("geolocation" in navigator && showAddressForm) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setAddressData((prev) => ({ ...prev, latitude, longitude }))
          reverseGeocode(latitude, longitude)
        },
        (error) => {
          console.warn("Geolocation denied:", error)
          setCurrentLocation({ lat: 14.5995, lng: 120.9842 })
        }
      )
    }
  }, [showAddressForm])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setAddressData((prev) => ({ ...prev, fullAddress: address }))
    } catch (err) {
      console.error("Geocoding error:", err)
    }
  }

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setAddressData((prev) => ({ ...prev, latitude: lat, longitude: lng, fullAddress: address }))
  }

  const handleGetCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available in your browser")
      return
    }
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        setAddressData((prev) => ({ ...prev, latitude, longitude }))
        reverseGeocode(latitude, longitude)
        setIsGettingLocation(false)
      },
      (error) => {
        console.warn("Geolocation error:", error)
        setIsGettingLocation(false)
        setError("Could not access your location. Please check permissions.")
      }
    )
  }

  const handleSearchAddress = (address: string, latitude: number, longitude: number) => {
    setAddressData((prev) => ({ ...prev, fullAddress: address, latitude, longitude }))
    setCurrentLocation({ lat: latitude, lng: longitude })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError("Please fill in all fields")
        setIsLoading(false)
        return
      }
      if (!formData.email.includes("@")) {
        setError("Please enter a valid email address")
        setIsLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long")
        setIsLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, action: "signup" }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.")
        setIsLoading(false)
        return
      }

      const user = data.user
      localStorage.setItem("user", JSON.stringify({ _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }))
      localStorage.setItem("userId", user._id)

      if (showAddressForm && addressData.phone && addressData.fullAddress) {
        try {
          await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, label: "Home", fullAddress: addressData.fullAddress, phone: addressData.phone, latitude: addressData.latitude, longitude: addressData.longitude, details: addressData.details, isDefault: true }),
          })
        } catch (addressError) {
          console.error("Error saving address:", addressError)
        }
      }

      const guestItems = getGuestCartForMerge()
      if (guestItems.length > 0) {
        try {
          await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, guestItems: guestItems }),
          })
          clearGuestCart()
        } catch (mergeError) {
          console.error("Failed to merge guest cart:", mergeError)
        }
      }

      setSuccess(true)
      setTimeout(() => { router.push("/catalog") }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gold text-charcoal p-3 rounded-lg"><BookOpen size={32} /></div>
            <div>
              <div className="font-serif font-bold text-2xl text-white">Sierbosten</div>
              <div className="text-sm text-gray-400">Literature Collective</div>
            </div>
          </Link>
        </div>

        {showAddressForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-screen overflow-y-auto">
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-white text-2xl">Create Account</CardTitle>
                  <CardDescription className="text-gray-400">Your login details</CardDescription>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <Alert className="bg-green-900/20 border-green-700">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-400">Account created successfully! Redirecting...</AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      {error && <Alert className="bg-red-900/20 border-red-700"><AlertCircle className="h-4 w-4 text-red-500" /><AlertDescription className="text-red-400">{error}</AlertDescription></Alert>}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">First Name</label><Input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Last Name</label><Input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                      </div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Email Address</label><Input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Password</label><div className="relative"><Input type={showPassword ? "text" : "password"} name="password" placeholder="" value={formData.password} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 pr-10" disabled={isLoading} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Confirm Password</label><div className="relative"><Input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="" value={formData.confirmPassword} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 pr-10" disabled={isLoading} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                      <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold" disabled={isLoading || !addressData.phone || !addressData.fullAddress}>{isLoading ? "Creating Account..." : "Create Account"}</Button>
                    </form>
                  )}
                  <div className="mt-6 text-center text-sm text-gray-400"><button onClick={() => setShowAddressForm(false)} className="text-gold hover:text-gold/80 font-semibold">Back</button></div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-white text-2xl flex items-center gap-2"><MapIcon size={24} />Delivery Address</CardTitle>
                  <CardDescription className="text-gray-400">Set your delivery location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Search Address</label><AddressSearch onSelectAddress={handleSearchAddress} placeholder="Type address, e.g., La Forte, BGC..." disabled={isLoading} /></div>
                  {currentLocation && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><label className="text-sm font-medium text-gray-300">Location Map</label><Button type="button" onClick={handleGetCurrentLocation} disabled={isGettingLocation} className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded">{isGettingLocation ? "Getting Location..." : "📍 Current Location"}</Button></div>
                      <div className="w-full h-64 bg-gray-700 rounded-lg overflow-hidden border border-gold/30"><AddressMap latitude={addressData.latitude} longitude={addressData.longitude} onLocationChange={handleLocationChange} onCurrentLocation={handleGetCurrentLocation} isGettingLocation={isGettingLocation} /></div>
                    </div>
                  )}
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Phone size={16} className="text-gold" />Phone Number (Required)</label><Input type="tel" placeholder="+63 9xxxxxxxxx" value={addressData.phone} onChange={(e) => setAddressData((prev) => ({ ...prev, phone: e.target.value }))} className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400" disabled={isLoading} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Full Address</label><Input type="text" placeholder="Your delivery address will appear here..." value={addressData.fullAddress} onChange={(e) => setAddressData((prev) => ({ ...prev, fullAddress: e.target.value }))} className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400" disabled={isLoading} /></div>
                  <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Delivery Instructions (Optional)</label><Input type="text" placeholder="Apt #, gate code, special instructions..." value={addressData.details} onChange={(e) => setAddressData((prev) => ({ ...prev, details: e.target.value }))} className="bg-gray-600 border-gray-500 text-white placeholder:text-gray-400" disabled={isLoading} /></div>
                  {addressData.fullAddress && <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg text-sm text-green-400"> Location set and ready to save</div>}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="space-y-2">
                <CardTitle className="text-white text-2xl">Create Account</CardTitle>
                <CardDescription className="text-gray-400">Join Sierbosten Literature Collective today</CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <Alert className="bg-green-900/20 border-green-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">Account created successfully! Redirecting...</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && <Alert className="bg-red-900/20 border-red-700"><AlertCircle className="h-4 w-4 text-red-500" /><AlertDescription className="text-red-400">{error}</AlertDescription></Alert>}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-300">First Name</label><Input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                      <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Last Name</label><Input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Email Address</label><Input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500" disabled={isLoading} /></div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Password</label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          name="password" 
                          placeholder="" 
                          value={formData.password} 
                          onChange={handleChange} 
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 pr-10" 
                          disabled={isLoading} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          name="confirmPassword" 
                          placeholder="" 
                          value={formData.confirmPassword} 
                          onChange={handleChange} 
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 pr-10" 
                          disabled={isLoading} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <Button type="button" onClick={() => setShowAddressForm(true)} className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold" disabled={isLoading}><MapPin size={18} className="mr-2" />Add Delivery Address (Optional)</Button>
                    <div className="pt-2 border-t border-gray-700">
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isLoading}>{isLoading ? "Creating Account..." : "Create Account"}</Button>
                    </div>
                  </form>
                )}
                <div className="mt-6 text-center text-sm text-gray-400">Already have an account? <Link href="/login" className="text-gold hover:text-gold/80 font-semibold">Sign In</Link></div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
