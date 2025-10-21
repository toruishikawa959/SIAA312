import { Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-charcoal text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Sierbosten Literature Collective. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
