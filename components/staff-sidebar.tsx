"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BookOpen, Package, ShoppingCart, BarChart3, Settings, LogOut, Menu, X, Home, Loader, CreditCard, Mail, Tag } from "lucide-react"

interface UserSession {
  email: string
  role: string
  firstName?: string
  lastName?: string
}

export function StaffSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    }
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    localStorage.removeItem("user")
    setUser(null)
    router.push("/")
  }

  const navItems = [
    { href: "/staff/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/staff/orders", label: "Orders", icon: ShoppingCart },
    { href: "/staff/inventory", label: "Inventory", icon: Package },
    { href: "/staff/coupons", label: "Coupons", icon: Tag },
    { href: "/staff/newsletter", label: "Newsletter", icon: Mail },
    { href: "/staff/mock-payment", label: "Mock Payment", icon: CreditCard },
  ]

  const isActive = (href: string) => pathname === href

  if (!mounted) return null

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-charcoal text-gold p-2 rounded-lg hover:bg-gray-800"
        title={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-charcoal to-gray-900 text-white shadow-lg z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gold text-charcoal p-2 rounded-lg group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="font-serif font-bold text-sm">Sierbosten</div>
              <div className="text-xs text-gray-400">Staff Portal</div>
            </div>
          </Link>
        </div>

        {/* User Info Section */}
        {user && (
          <div className="p-4 border-b border-gray-700 bg-gray-800/30">
            <p className="text-xs text-gray-400 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <p className="text-xs text-gold capitalize mt-1">{user.role}</p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gold text-charcoal font-semibold"
                    : "text-gray-300 hover:bg-gray-800 hover:text-gold"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-charcoal rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-gold transition-all"
          >
            <Home size={20} />
            <span>Back to Store</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-900/20 hover:text-coral transition-all disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut size={20} />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Content Spacing for Desktop */}
      <div className="hidden md:block w-64" />
    </>
  )
}
