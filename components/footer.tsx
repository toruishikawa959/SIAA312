"use client"

import { useState } from "react"
import { Mail, MapPin, Phone, Send, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setMessage({ type: "success", text: "Successfully subscribed to our newsletter!" })
      setEmail("")
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Something went wrong. Please try again." 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-charcoal text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">About Sierbosten</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              An inclusive publishing and literature collective promoting creative thinking, social responsibility, and
              collaboration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-300 hover:text-gold transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/catalog" className="text-gray-300 hover:text-gold transition-colors">
                  Catalog
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-gold transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-gold transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={16} />
                <span>hello@sierbosten.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin size={16} />
                <span>Portland, Oregon</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">
              Stay updated with new releases, events, and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-gold"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gold hover:bg-gold/90 text-charcoal font-semibold px-4"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
              {message && (
                <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Sierbosten Literature Collective. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
