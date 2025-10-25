// Guest cart utility - stores cart in localStorage for users not logged in

export interface GuestCartItem {
  bookId: string
  title: string
  author: string
  price: number
  quantity: number
  cover?: string
}

const GUEST_CART_KEY = "guest_cart"

/**
 * Get all items in guest cart from localStorage
 */
export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return []

  try {
    const cart = localStorage.getItem(GUEST_CART_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error("Failed to get guest cart:", error)
    return []
  }
}

/**
 * Add or update item in guest cart
 */
export function addToGuestCart(item: GuestCartItem): void {
  if (typeof window === "undefined") return

  try {
    const cart = getGuestCart()
    const existingItem = cart.find(i => i.bookId === item.bookId)

    if (existingItem) {
      existingItem.quantity += item.quantity
    } else {
      cart.push(item)
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error("Failed to add to guest cart:", error)
  }
}

/**
 * Update quantity of item in guest cart
 */
export function updateGuestCartQuantity(bookId: string, quantity: number): void {
  if (typeof window === "undefined") return

  try {
    const cart = getGuestCart()
    const item = cart.find(i => i.bookId === bookId)

    if (item) {
      if (quantity <= 0) {
        removeFromGuestCart(bookId)
      } else {
        item.quantity = quantity
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
      }
    }
  } catch (error) {
    console.error("Failed to update guest cart:", error)
  }
}

/**
 * Remove item from guest cart
 */
export function removeFromGuestCart(bookId: string): void {
  if (typeof window === "undefined") return

  try {
    const cart = getGuestCart()
    const filtered = cart.filter(i => i.bookId !== bookId)
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Failed to remove from guest cart:", error)
  }
}

/**
 * Clear entire guest cart
 */
export function clearGuestCart(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(GUEST_CART_KEY)
  } catch (error) {
    console.error("Failed to clear guest cart:", error)
  }
}

/**
 * Get total price of guest cart
 */
export function getGuestCartTotal(): number {
  return getGuestCart().reduce((total, item) => total + item.price * item.quantity, 0)
}

/**
 * Get item count in guest cart
 */
export function getGuestCartCount(): number {
  return getGuestCart().reduce((count, item) => count + item.quantity, 0)
}

/**
 * Convert guest cart to backend format for merging into user account
 */
export function getGuestCartForMerge(): Array<{ bookId: string; quantity: number }> {
  return getGuestCart().map(item => ({
    bookId: item.bookId,
    quantity: item.quantity,
  }))
}
