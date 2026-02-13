"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle, Loader } from "lucide-react"
import { getGuestCartForMerge, clearGuestCart } from "@/lib/guest-cart"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validation
      if (!email || !password) {
        setError("Please fill in all fields")
        setIsLoading(false)
        return
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address")
        setIsLoading(false)
        return
      }

      // Call auth API to verify credentials
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          action: "login",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Invalid email or password")
        setIsLoading(false)
        return
      }

      const user = data.user

      // Store user session in localStorage
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

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "staff") {
        router.push("/staff/orders")
      } else {
        router.push("/catalog")
      }
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

        {/* Login Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white text-2xl">Sign In</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-700">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-sm text-gold hover:text-gold/80">
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>


              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">

              Don't have an account?{" "}
              <Link href="/signup" className="text-gold hover:text-gold/80 font-semibold">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
