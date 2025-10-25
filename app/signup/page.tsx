"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle, CheckCircle } from "lucide-react"
import { getGuestCartForMerge, clearGuestCart } from "@/lib/guest-cart"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Validation
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

      // Call auth API to create user
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          action: "signup",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.")
        setIsLoading(false)
        return
      }

      const user = data.user

      // Store user session
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }),
      )

      // Store userId for guest cart merging
      localStorage.setItem("userId", user._id)

      // Merge guest cart if any items exist
      const guestItems = getGuestCartForMerge()
      if (guestItems.length > 0) {
        try {
          const mergeResponse = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              guestItems: guestItems,
            }),
          })

          if (mergeResponse.ok) {
            clearGuestCart()
            console.log("Guest cart merged successfully")
          }
        } catch (mergeError) {
          console.error("Failed to merge guest cart:", mergeError)
        }
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/catalog")
      }, 2000)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gold text-charcoal p-3 rounded-lg">
              <BookOpen size={32} />
            </div>
            <div>
              <div className="font-serif font-bold text-2xl text-white">Sierbosten</div>
              <div className="text-sm text-gray-400">Literature Collective</div>
            </div>
          </Link>
        </div>

        {/* Signup Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white text-2xl">Create Account</CardTitle>
            <CardDescription className="text-gray-400">Join Sierbosten Literature Collective today</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-900/20 border-green-700">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-400">
                    Account created successfully! Redirecting...
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert className="bg-red-900/20 border-red-700">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">First Name</label>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:text-gold/80 font-semibold">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
