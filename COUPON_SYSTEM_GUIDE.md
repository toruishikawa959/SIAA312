# Coupon System Implementation Guide

## Overview
Complete MongoDB/Mongoose coupon system with validation, usage tracking, and PayMongo webhook integration.

---

## 📁 Files Created

1. **`lib/models/Coupon.ts`** - Mongoose schema and model
2. **`lib/coupon-service.ts`** - Validation and helper functions
3. **`app/api/coupons/validate/route.ts`** - Public coupon validation API
4. **`app/api/admin/coupons/route.ts`** - Admin CRUD operations

---

## 🗂️ Database Schema

```typescript
interface ICoupon {
  code: string                    // Unique, uppercase, trimmed
  discountType: "PERCENTAGE" | "FIXED"
  discountAmount: number          // Min: 0
  minPurchaseAmount: number       // Default: 0, Min: 0
  expirationDate: Date
  isActive: boolean               // Default: true
  maxUses?: number                // Optional global limit
  usedCount: number               // Default: 0, auto-incremented
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔧 Core Functions

### 1. **validateCoupon(code, cartTotal)**
Validates coupon and calculates discount.

**Checks:**
- ✅ Coupon exists
- ✅ Is active (`isActive === true`)
- ✅ Not expired (`expirationDate > now`)
- ✅ Cart meets minimum (`cartTotal >= minPurchaseAmount`)
- ✅ Usage limit not reached (`usedCount < maxUses`)

**Returns:**
```typescript
{
  discount: number,      // Calculated discount amount
  coupon: ICoupon        // Full coupon details
}
```

**Throws errors:**
- "Invalid coupon code. This coupon does not exist."
- "This coupon is no longer active."
- "This coupon has expired."
- "Minimum purchase amount of ₱X.XX required to use this coupon."
- "This coupon has reached its maximum usage limit."

---

### 2. **incrementCouponUsage(code)**
Increments `usedCount` by 1 (for webhook).

**Usage in PayMongo Webhook:**
```typescript
if (order.couponCode) {
  await incrementCouponUsage(order.couponCode)
}
```

---

## 🌐 API Endpoints

### **POST /api/coupons/validate** (Public)
Validates a coupon code.

**Request:**
```json
{
  "code": "SAVE20",
  "cartTotal": 1500
}
```

**Response (Success):**
```json
{
  "success": true,
  "discount": 300,
  "coupon": {
    "code": "SAVE20",
    "discountType": "PERCENTAGE",
    "discountAmount": 20,
    "minPurchaseAmount": 500,
    "expirationDate": "2025-12-31T23:59:59.999Z",
    "usedCount": 45,
    "maxUses": 100
  }
}
```

**Response (Error):**
```json
{
  "error": "This coupon has expired."
}
```

---

### **Admin Endpoints** (`/api/admin/coupons`)

#### **GET** - List all coupons
Query params: `?isActive=true` (optional filter)

#### **POST** - Create new coupon
```json
{
  "code": "BLACKFRIDAY",
  "discountType": "PERCENTAGE",
  "discountAmount": 30,
  "minPurchaseAmount": 1000,
  "expirationDate": "2025-11-30T23:59:59.999Z",
  "isActive": true,
  "maxUses": 500
}
```

#### **PATCH** - Update coupon
```json
{
  "id": "507f1f77bcf86cd799439011",
  "isActive": false,
  "discountAmount": 25
}
```

#### **DELETE** - Delete coupon
Query params: `?id=507f1f77bcf86cd799439011`

---

## 💻 Frontend Integration Example

### Cart/Checkout Page Implementation

```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPeso } from "@/lib/currency"

export default function CheckoutPage() {
  const [cartTotal, setCartTotal] = useState(1500)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setLoading(true)
    setCouponError("")

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          cartTotal: cartTotal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setCouponError(data.error)
        setAppliedCoupon(null)
        setDiscount(0)
        return
      }

      // Success! Apply the discount
      setAppliedCoupon(data.coupon)
      setDiscount(data.discount)
      setCouponError("")
      
      console.log("Coupon applied:", data)
    } catch (err) {
      setCouponError("Failed to validate coupon")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode("")
    setCouponError("")
  }

  const finalTotal = cartTotal - discount

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Cart Summary */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formatPeso(cartTotal)}</span>
        </div>

        {/* Coupon Input */}
        <div className="my-4 p-4 border rounded">
          {!appliedCoupon ? (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={loading || !couponCode.trim()}
                  className="bg-gold hover:bg-yellow-500 text-charcoal"
                >
                  {loading ? "Validating..." : "Apply"}
                </Button>
              </div>

              {couponError && (
                <p className="text-red-600 text-sm mt-2">{couponError}</p>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-800 font-semibold">
                    ✓ Coupon Applied: {appliedCoupon.code}
                  </p>
                  <p className="text-green-600 text-sm">
                    {appliedCoupon.discountType === "PERCENTAGE"
                      ? `${appliedCoupon.discountAmount}% off`
                      : `₱${appliedCoupon.discountAmount} off`}
                  </p>
                </div>
                <Button
                  onClick={handleRemoveCoupon}
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Discount Display */}
        {discount > 0 && (
          <div className="flex justify-between text-green-600 mb-2">
            <span>Discount:</span>
            <span>-{formatPeso(discount)}</span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between text-xl font-bold border-t pt-2">
          <span>Total:</span>
          <span>{formatPeso(finalTotal)}</span>
        </div>
      </div>

      <Button className="w-full" onClick={() => {
        // Include coupon in order creation
        createOrder({
          items: cartItems,
          total: finalTotal,
          couponCode: appliedCoupon?.code,
          discount: discount,
        })
      }}>
        Proceed to Payment
      </Button>
    </div>
  )
}
```

---

## 🔄 Order Integration

### Update Order Schema
Add these fields to your order model:

```typescript
{
  // ... existing fields
  couponCode?: string,      // The applied coupon code
  discount: number,         // Discount amount applied
  subtotal: number,         // Amount before discount
  totalAmount: number,      // Final amount after discount
}
```

### Create Order API Update
```typescript
// In /api/orders POST handler
const orderData = {
  items: body.items,
  subtotal: body.subtotal,
  couponCode: body.couponCode || null,
  discount: body.discount || 0,
  totalAmount: body.total,
  deliveryMethod: body.deliveryMethod,
  // ... other fields
}
```

---

## ✅ Webhook Integration (Already Done!)

The PayMongo webhook has been updated to automatically increment coupon usage:

```typescript
// In /app/api/webhooks/paymongo/route.ts
case "payment.paid": {
  // ... existing code

  // Increment coupon usage if a coupon was used
  if (order.couponCode) {
    await incrementCouponUsage(order.couponCode)
  }

  // ... send emails
}
```

---

## 🧪 Testing Examples

### Create Test Coupons

```javascript
// 20% off, minimum ₱500, unlimited uses
{
  "code": "WELCOME20",
  "discountType": "PERCENTAGE",
  "discountAmount": 20,
  "minPurchaseAmount": 500,
  "expirationDate": "2025-12-31T23:59:59.999Z",
  "isActive": true
}

// ₱100 flat discount, limited to 50 uses
{
  "code": "SAVE100",
  "discountType": "FIXED",
  "discountAmount": 100,
  "minPurchaseAmount": 0,
  "expirationDate": "2025-12-31T23:59:59.999Z",
  "isActive": true,
  "maxUses": 50
}

// Black Friday 50% off, minimum ₱2000
{
  "code": "BLACKFRIDAY50",
  "discountType": "PERCENTAGE",
  "discountAmount": 50,
  "minPurchaseAmount": 2000,
  "expirationDate": "2025-11-30T23:59:59.999Z",
  "isActive": true,
  "maxUses": 200
}
```

### Test Validation

```bash
# Valid coupon
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME20", "cartTotal": 1000}'

# Below minimum
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "WELCOME20", "cartTotal": 200}'

# Expired/invalid
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "EXPIRED", "cartTotal": 1000}'
```

---

## 📊 Admin Dashboard Integration

You can create an admin page at `/app/admin/coupons/page.tsx` to manage coupons:

- List all coupons with status (active/inactive/expired)
- Create new coupons with form
- Edit existing coupons
- View usage statistics (usedCount / maxUses)
- Deactivate/delete coupons

---

## 🔐 Security Notes

1. ✅ Coupon codes are automatically uppercased and trimmed
2. ✅ Validation prevents negative discounts
3. ✅ Usage limits are enforced before payment
4. ✅ Atomic increment using `$inc` prevents race conditions
5. ✅ Admin endpoints should be protected with authentication
6. ✅ Webhook failures don't block payment processing

---

## 🚀 Quick Start

1. Create a test coupon via admin API
2. Add coupon input to your checkout page
3. Validate coupon before order creation
4. Include `couponCode` and `discount` in order payload
5. PayMongo webhook will auto-increment usage on payment

---

## 📝 Summary

✅ **Mongoose Schema** - Complete with validation and indexes  
✅ **Validation Function** - All checks implemented  
✅ **Webhook Integration** - Auto-increment on payment  
✅ **Public API** - Frontend coupon validation  
✅ **Admin API** - Full CRUD operations  
✅ **Helper Functions** - Utility functions for common tasks  

Your coupon system is ready to use! 🎉
