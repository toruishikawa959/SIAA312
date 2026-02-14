"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface AddressSearchProps {
  onSelectAddress: (address: string, latitude: number, longitude: number) => void
  placeholder?: string
  disabled?: boolean
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

export function AddressSearch({ onSelectAddress, placeholder = "Search address (e.g., La Forte, BGC)", disabled = false }: AddressSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (query.trim().length < 2) {
      setResults([])
      return
    }

    setIsLoading(true)

    timeoutRef.current = setTimeout(async () => {
      try {
        // Search within Philippines boundaries for faster results
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=ph&limit=6`,
          {
            headers: {
              "Accept-Language": "en-US",
            },
          }
        )
        const data = await response.json()
        setResults(data || [])
        setIsOpen(true)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // Debounce 300ms
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelectResult = (result: SearchResult) => {
    const address = result.display_name
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    onSelectAddress(address, lat, lng)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 bg-gray-600 border border-gray-500 text-white placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 z-50">
          Searching...
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-gold/20 transition-colors border-b border-gray-600 last:border-b-0 text-white text-sm"
            >
              <div className="font-medium truncate">{result.display_name}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-gray-400 z-50 text-center">
          No results found
        </div>
      )}
    </div>
  )
}
