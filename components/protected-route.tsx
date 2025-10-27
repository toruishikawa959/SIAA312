"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "staff" | "admin"
}

/**
 * ProtectedRoute - Middleware component to protect staff/admin pages
 * Checks if user is logged in and has the required role
 * Redirects to login if not authenticated or doesn't have required role
 */
export function ProtectedRoute({ children, requiredRole = "staff" }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem("user")
        
        if (!userStr) {
          // Not logged in
          router.push("/login")
          return
        }

        const user = JSON.parse(userStr)

        // Check if user has the required role
        if (requiredRole === "staff" && user.role !== "staff" && user.role !== "admin") {
          // User doesn't have staff or admin role
          router.push("/")
          return
        }

        if (requiredRole === "admin" && user.role !== "admin") {
          // User doesn't have admin role
          router.push("/")
          return
        }

        // User is authorized
        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={48} className="text-gold animate-spin" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Router will redirect, don't render anything
  }

  return <>{children}</>
}
