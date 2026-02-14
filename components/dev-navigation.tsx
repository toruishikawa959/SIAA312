"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, Users, Database, Settings, Ticket } from "lucide-react"


const devLinks = [
  { href: "/dev/users", label: "Users", icon: Users },
  { href: "/dev/database", label: "Database", icon: Database },
  { href: "/dev/data-generator", label: "Historical Data", icon: Code2 },
  { href: "/dev/current-year", label: "Current Year", icon: Settings },
  { href: "/dev/coupons", label: "Coupons", icon: Code2 },
  { href: "/dev/demo-coupon", label: "Demo Coupon", icon: Ticket },
]


export function DevNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Code2 className="text-yellow-400" size={24} />
            <span className="font-bold text-lg">DEV MODE</span>
          </div>
          
          <div className="flex items-center gap-1">
            {devLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition ${
                    isActive
                      ? "bg-yellow-400 text-gray-900 font-semibold"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition"
          >
            Exit Dev Mode
          </Link>
        </div>
      </div>
    </nav>
  )
}
