"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Menu, X, User, LogOut, Loader } from "lucide-react"
import { BookOpen } from "lucide-react"

interface UserSession {
  email: string
  role: string
  id: string
}

export function Navigation() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 500))
    localStorage.removeItem("user")
    setUser(null)
    setIsLoggedIn(false)
    setShowUserMenu(false)
    setIsLoggingOut(false)
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-charcoal text-white h-16 flex items-center px-4 md:px-8 shadow-lg">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gold text-charcoal p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="font-serif font-bold text-lg">Sierbosten</div>
            <div className="text-xs text-gray-300">Literature Collective</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-gold transition-colors">
            Catalog
          </Link>
          {isLoggedIn && (
            <>
              <Link href="/orders" className="hover:text-gold transition-colors">
                My Orders
              </Link>
              
            </>
          )}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-gold transition-colors">
              Admin
            </Link>
          )}
          {user?.role === "staff" && (
            <Link href="/staff/orders" className="hover:text-gold transition-colors">
              Staff
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <Link href="/cart" className="relative hover:text-gold transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-coral text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            {mounted ? (
              isLoggedIn ? (
                <button
                  type="button"
                  title="User profile menu"
                  aria-label="User profile menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-gold transition-colors"
                >
                  <User size={20} />
                </button>
              ) : (
                <Link href="/login" className="hover:text-gold transition-colors">
                  Sign In
                </Link>
              )
            ) : (
              <Link href="/login" className="hover:text-gold transition-colors">
                Sign In
              </Link>
            )}

            {mounted && isLoggedIn && showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-gray-300">{user?.email}</p>
                  <p className="text-xs text-gold capitalize font-semibold">{user?.role}</p>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gold transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Profile
                </Link>
                <button
                  type="button"
                  title="Sign out"
                  aria-label="Sign out"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-coral flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            title={isOpen ? "Close menu" : "Open menu"}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="md:hidden" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-charcoal border-t border-gray-700 md:hidden">
          <div className="flex flex-col gap-4 p-4">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <Link href="/catalog" className="hover:text-gold transition-colors">
              Catalog
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/orders" className="hover:text-gold transition-colors">
                  My Orders
                </Link>
                
                {user?.role === "admin" && (
                  <Link href="/admin/dashboard" className="hover:text-gold transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                {user?.role === "staff" && (
                  <Link href="/staff/orders" className="hover:text-gold transition-colors">
                    Staff Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-left hover:text-coral transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Sign Out
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
