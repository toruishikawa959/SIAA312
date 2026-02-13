# Catalog Image Fix - TODO

## Problem Analysis
- Database books have TWO image fields: `image` (base64) and `imageUrl` (path/URL)
- Catalog component only checks `book.image`, missing books that only have `imageUrl`
- Book interface missing `imageUrl` field

## Fix Steps

### 1. Update Type Definition ✅
- [x] Add `imageUrl?: string` to Book interface in `lib/types.ts`

### 2. Update API Response ✅
- [x] Ensure `imageUrl` is included in book responses in `app/api/books/route.ts`

### 3. Fix Catalog Component ✅
- [x] Update image source logic to check: `book.image` → `book.imageUrl` → `/placeholder.svg`
- [x] Add helper function to resolve image URLs (handle relative vs absolute paths)
- [x] Improve error handling with better fallback display

### 4. Testing
- [ ] Verify catalog page shows images
- [ ] Check browser network tab for 404 errors
- [ ] Confirm placeholder.svg exists in public folder


## Files to Edit
1. `lib/types.ts`
2. `app/api/books/route.ts`
3. `app/catalog/page.tsx`
