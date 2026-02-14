/**
 * API client utilities for frontend to communicate with backend
 */

/**
 * Get the API base URL
 * In browser: Uses current window location (handles dynamic port changes)
 * In server: Uses environment variable
 */
function getApiBaseUrl(): string {
  // Browser environment - use current location (automatically handles port changes)
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Server environment - use environment variable
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
}

const API_BASE_URL = getApiBaseUrl()

// ===== Books =====
export async function fetchBooks(category?: string) {
  const url = new URL(`${API_BASE_URL}/api/books`)
  if (category) url.searchParams.append("category", category)

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error("Failed to fetch books")
  return response.json()
}

export async function fetchBook(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/books?id=${id}`)
  if (!response.ok) throw new Error("Failed to fetch book")
  return response.json()
}

export async function createBook(bookData: any) {
  const response = await fetch(`${API_BASE_URL}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  })
  if (!response.ok) throw new Error("Failed to create book")
  return response.json()
}

// ===== Auth =====
export async function signup(email: string, password: string, firstName: string, lastName: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "signup",
      email,
      password,
      firstName,
      lastName,
    }),
  })
  if (!response.ok) throw new Error("Failed to sign up")
  return response.json()
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "login",
      email,
      password,
    }),
  })
  if (!response.ok) throw new Error("Failed to login")
  return response.json()
}

export async function fetchUserProfile(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth?id=${userId}`)
  if (!response.ok) throw new Error("Failed to fetch user profile")
  return response.json()
}

// ===== Cart =====
export async function fetchCart(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/cart?userId=${userId}`)
  if (!response.ok) throw new Error("Failed to fetch cart")
  return response.json()
}

export async function addToCart(userId: string, bookId: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, bookId, quantity }),
  })
  if (!response.ok) throw new Error("Failed to add to cart")
  return response.json()
}

export async function updateCartItem(userId: string, bookId: string, quantity: number) {
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, bookId, quantity }),
  })
  if (!response.ok) throw new Error("Failed to update cart")
  return response.json()
}

export async function clearCart(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/cart?userId=${userId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Failed to clear cart")
  return response.json()
}

// ===== Orders =====
export async function createOrder(userId: string, items: any[], shippingAddress: string) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, items, shippingAddress }),
  })
  if (!response.ok) throw new Error("Failed to create order")
  return response.json()
}

export async function fetchUserOrders(userId: string) {
  const response = await fetch(`${API_BASE_URL}/api/orders?userId=${userId}`)
  if (!response.ok) throw new Error("Failed to fetch orders")
  return response.json()
}

export async function fetchOrder(orderId: string) {
  const response = await fetch(`${API_BASE_URL}/api/orders?orderId=${orderId}`)
  if (!response.ok) throw new Error("Failed to fetch order")
  return response.json()
}

export async function fetchAllOrders() {
  const response = await fetch(`${API_BASE_URL}/api/orders`)
  if (!response.ok) throw new Error("Failed to fetch orders")
  return response.json()
}

export async function updateOrderStatus(orderId: string, status: string) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  })
  if (!response.ok) throw new Error("Failed to update order")
  return response.json()
}

// ===== Inventory =====
export async function fetchLowStockBooks() {
  const response = await fetch(`${API_BASE_URL}/api/inventory`)
  if (!response.ok) throw new Error("Failed to fetch low stock books")
  return response.json()
}

export async function updateInventory(
  bookId: string,
  quantity: number,
  action: "add" | "remove" | "adjust",
  reason: string,
  staffId?: string
) {
  const response = await fetch(`${API_BASE_URL}/api/inventory`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId, quantity, action, reason, staffId }),
  })
  if (!response.ok) throw new Error("Failed to update inventory")
  return response.json()
}
