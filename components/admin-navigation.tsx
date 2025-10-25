"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User } from "lucide-react"
import { BookOpen } from "lucide-react"

export function AdminNavigation({ userType = "admin" }) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems =
    userType === "admin"
      ? [
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Inventory", href: "/admin/inventory" },
          { label: "Orders", href: "/admin/orders" },
          { label: "Users", href: "/admin/users" },
        ]
      : [
          { label: "Orders", href: "/staff/orders" },
          { label: "Inventory", href: "/staff/inventory" },
        ]

  return (
    <nav className="sticky top-0 z-50 bg-charcoal text-white h-16 flex items-center px-4 md:px-8 shadow-lg">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Logo */}
        <Link href={userType === "admin" ? "/admin/dashboard" : "/staff/orders"} className="flex items-center gap-2">
          <div className="bg-gold text-charcoal p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="font-serif font-bold text-lg">Sierbosten</div>
            <div className="text-xs text-gray-300">{userType === "admin" ? "Admin" : "Staff"} Panel</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gold transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            title="User profile"
            aria-label="User profile menu"
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <User size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            title={isOpen ? "Close menu" : "Open menu"}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="md:hidden" 
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-charcoal border-t border-gray-700 md:hidden">
          <div className="flex flex-col gap-4 p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-gold transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
