"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface AddressMapProps {
  latitude: number
  longitude: number
  onLocationChange: (lat: number, lng: number, address: string) => void
  zoom?: number
  editable?: boolean
  onCurrentLocation?: () => void
  isGettingLocation?: boolean
}

export function AddressMap({
  latitude,
  longitude,
  onLocationChange,
  zoom = 15,
  editable = true,
  onCurrentLocation,
  isGettingLocation = false,
}: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    let timeoutId: NodeJS.Timeout | null = null
    let attempts = 0
    const maxAttempts = 5

    const initializeMap = () => {
      try {
        if (!mapRef.current || mapInstanceRef.current) return

        // Ensure container has proper dimensions before creating map
        mapRef.current.style.width = "100%"
        mapRef.current.style.height = "256px"

        // Verify container has valid dimensions
        if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
          if (attempts < maxAttempts) {
            attempts++
            timeoutId = setTimeout(initializeMap, 50)
          } else {
            console.error("Map container dimensions failed to initialize after max attempts")
          }
          return
        }

        // Create map - wrapped in try/catch to handle Leaflet errors
        try {
          const map = L.map(mapRef.current, { 
            preferCanvas: true,
            zoomControl: true 
          }).setView([latitude, longitude], zoom)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          // Fix marker icon paths for Leaflet
          const defaultIcon = L.icon({
            iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'%3E%3Cpath fill='%233388ff' d='M12.5 0C5.6 0 0 5.6 0 12.5 0 20 12.5 41 12.5 41s12.5-21 12.5-28.5C25 5.6 19.4 0 12.5 0z'/%3E%3Ccircle cx='12.5' cy='12.5' r='4' fill='white'/%3E%3C/svg%3E",
            shadowUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='41' height='41' viewBox='0 0 41 41'%3E%3Cellipse cx='20.5' cy='38' rx='15' ry='3' fill='black' opacity='0.3'/%3E%3C/svg%3E",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [0, -41],
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
          })

          // Add marker
          const marker = L.marker([latitude, longitude], {
            draggable: editable,
            icon: defaultIcon,
          }).addTo(map)

          mapInstanceRef.current = map
          markerRef.current = marker

          // Handle marker drag
          if (editable) {
            marker.on("dragend", async () => {
              const pos = marker.getLatLng()
              await reverseGeocodeAndUpdate(pos.lat, pos.lng)
            })
          }

          // Handle map click
          if (editable) {
            map.on("click", async (e: L.LeafletMouseEvent) => {
              marker.setLatLng(e.latlng)
              await reverseGeocodeAndUpdate(e.latlng.lat, e.latlng.lng)
            })
          }

          // Trigger invalidateSize after slight delay to ensure proper rendering
          setTimeout(() => {
            try {
              map.invalidateSize()
            } catch (e) {
              console.warn("Error invalidating map size:", e)
            }
          }, 100)
        } catch (leafletError) {
          console.error("Leaflet initialization error:", leafletError)
        }
      } catch (error) {
        console.error("Map initialization error:", error)
      }
    }

    // Use requestAnimationFrame for initial setup
    requestAnimationFrame(initializeMap)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      try {
        // Cleanup on unmount - check if map still exists first
        if (mapInstanceRef.current && mapRef.current?.parentElement) {
          mapInstanceRef.current.remove()
        }
      } catch (e) {
        console.warn("Error cleaning up map:", e)
      } finally {
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [latitude, longitude, zoom, editable])

  // Reverse geocode coordinates to get address
  const reverseGeocodeAndUpdate = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const address = data.address?.road
        ? `${data.address.road}, ${data.address.city || data.address.county}, ${data.address.state}`
        : data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

      onLocationChange(lat, lng, address)
    } catch (error) {
      console.error("Geocoding error:", error)
      onLocationChange(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } finally {
      setLoading(false)
    }
  }

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([latitude, longitude])
      }
    }
  }, [latitude, longitude])

  return (
    <div className="space-y-3">
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border-2 border-gold/30 overflow-hidden relative"
      >
        {onCurrentLocation && (
          <button
            onClick={onCurrentLocation}
            disabled={isGettingLocation}
            title="Get current location"
            className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-100 disabled:bg-gray-200 text-charcoal p-2 rounded-lg shadow-lg transition-colors"
            aria-label="Use current location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
      {loading && <p className="text-sm text-gray-500">📍 Getting address...</p>}
      {isGettingLocation && <p className="text-sm text-blue-500">📍 Getting your current location...</p>}
      {editable && (
        <p className="text-xs text-gray-500">
          💡 Click on map or drag the marker to set delivery location
        </p>
      )}
    </div>
  )
}
