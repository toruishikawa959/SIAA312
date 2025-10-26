"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader } from "lucide-react"

export function PageLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader size={48} className="text-gold animate-spin" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}
