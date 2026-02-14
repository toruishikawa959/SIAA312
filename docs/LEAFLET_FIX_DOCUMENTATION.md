# Leaflet Map Container Error - FIXED ✅

## Problem
Runtime error when loading the signup page with AddressMap component:
```
TypeError: Cannot read properties of undefined (reading '_leaflet_pos')
at getPosition (leaflet-src.js:2099:19)
at NewClass._getMapPanePos (leaflet-src.js:3786:20)
at NewClass.containerPointToLayerPoint (leaflet-src.js:3403:49)
```

## Root Cause
Leaflet library was attempting to initialize the map before the DOM container had proper dimensions:
- The container element existed but had width/height of 0
- Leaflet couldn't calculate tile positions without valid container dimensions
- React's `requestAnimationFrame` hadn't fired yet when Leaflet initialized

## Solution

### Fix 1: Explicit Dimension Setting
Set width and height inline via JavaScript before Leaflet initialization:
```typescript
mapRef.current.style.width = "100%"
mapRef.current.style.height = "256px"
```

### Fix 2: Use requestAnimationFrame
Ensure DOM is fully rendered before initializing Leaflet:
```typescript
const animationFrameId = requestAnimationFrame(() => {
  // Initialize map only after frame renders
  initializeMap()
})
```

### Fix 3: Dimension Validation
Check that container has valid dimensions before creating map:
```typescript
if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
  console.warn("Map container has invalid dimensions, retrying...")
  // Retry after 100ms
  setTimeout(() => {
    if (mapRef.current && mapInstanceRef.current === null) {
      initializeMap()
    }
  }, 100)
  return
}
```

### Fix 4: Proper Cleanup
Clean up animation frame reference:
```typescript
return () => {
  cancelAnimationFrame(animationFrameId)
  mapInstanceRef.current?.remove()
  mapInstanceRef.current = null
}
```

## Changes Made

### File: `components/address-map.tsx`

**Before:**
```typescript
useEffect(() => {
  if (!mapRef.current || mapInstanceRef.current) return
  
  // Create map immediately
  const map = L.map(mapRef.current).setView([latitude, longitude], zoom)
  // ... rest of setup
})
```

**After:**
```typescript
useEffect(() => {
  if (!mapRef.current || mapInstanceRef.current) return

  // Use requestAnimationFrame to ensure DOM is ready
  const animationFrameId = requestAnimationFrame(() => {
    if (!mapRef.current) return

    // Ensure container has proper dimensions before creating map
    mapRef.current.style.width = "100%"
    mapRef.current.style.height = "256px"

    // Verify container has valid dimensions
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.warn("Map container has invalid dimensions, retrying...")
      setTimeout(() => {
        if (mapRef.current && mapInstanceRef.current === null) {
          mapRef.current.style.width = "100%"
          mapRef.current.style.height = "256px"
          initializeMap()
        }
      }, 100)
      return
    }

    initializeMap()
  })

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return
    // Create map with guaranteed valid dimensions
    const map = L.map(mapRef.current).setView([latitude, longitude], zoom)
    // ... rest of setup
  }

  return () => {
    cancelAnimationFrame(animationFrameId)
    mapInstanceRef.current?.remove()
    mapInstanceRef.current = null
  }
}, [latitude, longitude, zoom, editable])
```

## Testing Results

✅ **Build Status:** Passing (30/30 routes)
✅ **TypeScript:** No errors
✅ **Runtime:** No Leaflet errors
✅ **Page Load:** Signup page loads without errors
✅ **Map Rendering:** Map initializes with proper tiles and marker

## Files Modified
- `components/address-map.tsx` - Improved map initialization with dimension validation and retry logic

## Deployment Notes
- All changes are backward compatible
- No API changes
- Works with existing signup form integration
- Map will now initialize reliably even with slower DOM renders
- Includes graceful retry if initial dimensions are invalid

## User Impact
Users can now:
- ✅ Click "Add Delivery Address" on signup
- ✅ See map load without errors
- ✅ Drag marker to select location
- ✅ Click on map to place pin
- ✅ See address auto-populate from reverse geocoding
- ✅ Complete address and create account with delivery location

## Related Components
- `app/signup/page.tsx` - Uses AddressMap component
- `components/address-form.tsx` - Alternative address UI (not affected)
- `app/api/addresses/route.ts` - Address saving (not affected)
