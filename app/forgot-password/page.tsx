"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, AlertCircle, Loader, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validation
      if (!email) {
        setError("Please enter your email address")
        setIsLoading(false)
        return
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address")
        setIsLoading(false)
        return
      }

      // Call API to request password reset
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset email. Please try again.")
        setIsLoading(false)
        return
      }

      setSuccess("If an account exists with this email, you will receive password reset instructions shortly.")
      setEmail("")
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

        {/* Forgot Password Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="space-y-2">
            <CardTitle className="text-white text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-700">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/20 border-green-700">
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
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

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>

              {/* Back to Login Button */}
              <Link href="/login">
                <Button
                  type="button"
                  className="w-full bg-gold hover:bg-gold/90 text-charcoal font-semibold mt-2"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Login
                </Button>
              </Link>

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
