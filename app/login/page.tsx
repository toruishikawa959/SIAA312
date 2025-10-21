"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle } from "lucide-react"

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
      // Simulate authentication - in production, this would call an API
      if (!email || !password) {
        setError("Please fill in all fields")
        return
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address")
        return
      }

      // Mock authentication - store user session
      const mockUsers = [
        { email: "customer@example.com", password: "password123", role: "customer" },
        { email: "staff@example.com", password: "password123", role: "staff" },
        { email: "admin@example.com", password: "password123", role: "admin" },
      ]

      const user = mockUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        setError("Invalid email or password")
        return
      }

      // Store user session in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: user.email,
          role: user.role,
          id: Math.random().toString(36).substr(2, 9),
        }),
      )

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
                <label className="text-sm font-medium text-gray-300">Password</label>
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
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Demo Credentials</span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <p>
                  <strong className="text-gold">Customer:</strong> customer@example.com / password123
                </p>
                <p>
                  <strong className="text-gold">Staff:</strong> staff@example.com / password123
                </p>
                <p>
                  <strong className="text-gold">Admin:</strong> admin@example.com / password123
                </p>
              </div>
            </div>

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
