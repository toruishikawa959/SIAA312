# 🧪 Guest Checkout - Testing Instructions

## Prerequisites
- MongoDB running locally (or check your connection string in `lib/db.ts`)
- Dev server running: `npm run dev`
- Server running at http://localhost:3001

---

## Test 1: Basic Flow (No PayMongo Key Needed)

### Steps:
1. **Navigate to Catalog**
   ```
   Go to http://localhost:3001/catalog
   ```

2. **Add First Book to Cart**
   - Click on any book to view details
   - Verify book shows title, author, price
   - Click "Add to Cart" button
   - See confirmation (button might change state)
   - Click back to catalog or click another book

3. **Add Second Book (Optional)**
   - Click another book
   - Click "Add to Cart"
   - Back to catalog

4. **View Cart**
   ```
   Go to http://localhost:3001/cart
   or click "Cart" in navigation menu
   ```
   - Verify books are listed
   - Verify quantities and prices
   - You should see items from localStorage

5. **Start Checkout**
   - Click "Checkout" button
   - Should redirect to `/checkout`

6. **Fill Checkout Form**
   ```
   Email: test@example.com
   Full Name: Test User
   Phone: +63 9181234567
   ```
   - Click "Delivery" or "Store Pickup"
   - **If Delivery Selected:**
     - Street Address: 123 Main Street
     - City: Manila
     - Postal Code: 1000

7. **Review Order Summary**
   - Should show your items
   - Subtotal calculation
   - VAT (12%)
   - Delivery fee (if applicable)
   - Total amount

8. **Submit Order**
   - Click "Proceed to Payment"
   - Form should validate:
     - ✅ Email format checked
     - ✅ Required fields validated
     - ✅ Address required if delivery selected

9. **Check Order Creation**
   - Should redirect to `/checkout/payment?orderId=XXXX`
   - Should see your order ID

10. **Verify in Database**
    ```
    // Open MongoDB Compass or MongoDB Shell
    use bookstore
    db.orders.findOne({ guestEmail: "test@example.com" })
    ```
    
    **Expected Result:**
    ```json
    {
      "_id": ObjectId(...),
      "items": [
        {
          "bookId": ObjectId(...),
          "title": "Book Title",
          "quantity": 1,
          "price": 350
        }
      ],
      "totalAmount": 392,  // 350 + 42 (VAT)
      "status": "pending",
      "paymentStatus": "pending",
      "deliveryMethod": "pickup",  // or "delivery"
      "shippingAddress": "Store Pickup",  // or full address
      "guestEmail": "test@example.com",
      "guestName": "Test User",
      "guestPhone": "+63 9181234567",
      "createdAt": ISODate(...),
      "updatedAt": ISODate(...)
    }
    ```

---

## Test 2: Form Validation

### Test Case 2A: Missing Email
**Action:** Leave email blank, click "Proceed to Payment"
**Expected:** Error message: "Please fill in all required fields"

### Test Case 2B: Invalid Email
**Action:** Enter "notanemail", click "Proceed to Payment"
**Expected:** Error message: "Please enter a valid email address"

### Test Case 2C: Missing Name
**Action:** Leave name blank, click "Proceed to Payment"
**Expected:** Error message: "Please fill in all required fields"

### Test Case 2D: Missing Phone
**Action:** Leave phone blank, click "Proceed to Payment"
**Expected:** Error message: "Please fill in all required fields"

### Test Case 2E: Delivery Without Address
**Action:**
1. Select "Delivery"
2. Leave address fields blank
3. Click "Proceed to Payment"
**Expected:** Error message: "Please fill in all delivery address fields"

### Test Case 2F: Valid Pickup (No Address Required)
**Action:**
1. Fill: email, name, phone
2. Select "Store Pickup"
3. Leave address fields blank
4. Click "Proceed to Payment"
**Expected:** Order should create successfully (address fields not required)

---

## Test 3: Pricing Calculations

### Setup
**Add these items to cart:**
- Book 1: ₱350 (qty 1)
- Book 2: ₱450 (qty 1)

### Test Case 3A: Pickup (No Delivery Fee)
**Action:** Select "Store Pickup"
**Expected:**
```
Subtotal: ₱800
VAT (12%): ₱96
Delivery Fee: ₱0
TOTAL: ₱896
```

### Test Case 3B: Delivery (With Fee)
**Action:** Select "Delivery"
**Expected:**
```
Subtotal: ₱800
VAT (12%): ₱96
Delivery Fee: ₱100
TOTAL: ₱996
```

---

## Test 4: Guest Cart Integration

### Test Case 4A: Cart Persists After Navigation
**Action:**
1. Add book to cart
2. Go to homepage (click logo)
3. Return to cart (`/cart`)
**Expected:** Book still in cart (stored in localStorage)

### Test Case 4B: Guest Cart Clears on Success
**Action:**
1. Complete full checkout flow (up to payment page)
2. Create order successfully
3. Check localStorage in browser devtools
**Expected:** Guest cart should be empty after success page loads

---

## Test 5: Payment Page (Without PayMongo Key)

### Test Case 5A: Navigate to Payment
**Action:** Complete checkout → redirected to `/checkout/payment?orderId=XXX`
**Expected:**
- Order ID displayed
- Order details shown
- "Generate Payment QR Code" button visible
- Click button should show error (expected without PayMongo key)

### Test Case 5B: Check Browser Console
**Action:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Click "Generate Payment QR Code"
**Expected:** See error about PayMongo key or fetch failure

---

## Test 6: Multiple Guest Orders

### Test Case 6A: Create Second Order with Different Email
**Action:**
1. Add different items to cart
2. Go through checkout with: test2@example.com
3. Submit order
4. Check database
**Expected:** Both orders exist in database with different emails

### Test Case 6B: Verify Database
```javascript
db.orders.find({ guestEmail: { $exists: true } })
```
**Expected:** Should return 2+ orders

---

## Test 7: Stock Deduction

### Test Case 7A: Check Stock Before Order
```javascript
db.books.findOne({ title: "Your Book Title" })
// Note the "stock" field value
```

### Test Case 7B: Create Order
- Add book (qty 1) to cart
- Complete checkout
- Submit order

### Test Case 7C: Check Stock After Order
```javascript
db.books.findOne({ title: "Your Book Title" })
```
**Expected:** Stock decreased by 1

---

## Test 8: Mobile Responsiveness

### Test Case 8A: Checkout on Mobile
**Action:**
1. Open Chrome DevTools
2. Toggle Device Toolbar (mobile view)
3. Go through checkout flow
**Expected:**
- Form fields stack vertically
- Buttons readable and clickable
- Order summary visible on narrow screens
- All text readable

### Test Case 8B: Payment on Mobile
**Action:** Mobile view of `/checkout/payment`
**Expected:**
- QR code displays properly on small screen
- All text readable
- Buttons appropriately sized

---

## Test 9: Browser Console & DevTools

### Check Network Requests
1. Open DevTools → Network tab
2. Go through checkout
3. Click "Proceed to Payment"

**Expected Requests:**
```
POST /api/orders
Status: 201
Response: { orderId: "...", items: [...], totalAmount: ... }
```

### Check localStorage
1. Open DevTools → Application → localStorage
2. Look for key like `guestCart`
3. Before checkout: Should have items
4. After success page loads: Should be empty

---

## Test 10: Error Scenarios

### Test Case 10A: No Items in Cart
**Action:**
1. Clear cart/browser cache
2. Navigate directly to `/checkout`
**Expected:** Redirected back to `/cart` (no items to checkout)

### Test Case 10B: Out of Stock
**Action:**
1. Manually reduce book stock to 0 in database
2. Try to add to cart
3. Proceed to checkout
4. Should see error about insufficient stock
**Expected:** Order creation fails with error message

### Test Case 10C: Invalid Order ID
**Action:** Navigate to `/checkout/payment?orderId=invalid123`
**Expected:** Error message "Order Not Found"

---

## Debugging Commands

### MongoDB Queries
```javascript
// Connection
use bookstore

// Find all guest orders
db.orders.find({ guestEmail: { $exists: true } }).pretty()

// Find specific guest order
db.orders.findOne({ guestEmail: "test@example.com" })

// Check book stock
db.books.findOne({ _id: ObjectId("...") })

// Count guest orders
db.orders.countDocuments({ guestEmail: { $exists: true } })

// Update order status (testing)
db.orders.updateOne(
  { guestEmail: "test@example.com" },
  { $set: { paymentStatus: "paid", status: "processing" } }
)

// Delete test order
db.orders.deleteOne({ guestEmail: "test@example.com" })
```

### Browser DevTools
```javascript
// Check localStorage
localStorage.getItem('guestCart')

// Clear localStorage
localStorage.removeItem('guestCart')
localStorage.clear()

// View all keys
Object.keys(localStorage)
```

### Server Logs
```
npm run dev
// Watch terminal for API calls and errors
```

---

## Expected Success Indicators

### ✅ Checkout Form
- [ ] All fields display correctly
- [ ] Delivery/Pickup toggle works
- [ ] Address fields show/hide conditionally
- [ ] Order summary updates in real-time
- [ ] Form validation prevents submission on errors
- [ ] Successful submission shows no errors

### ✅ Order Creation
- [ ] Order appears in database
- [ ] All fields populated correctly
- [ ] Status is "pending"
- [ ] paymentStatus is "pending"
- [ ] Items list is accurate
- [ ] Total amount calculated correctly
- [ ] Guest fields populated with form data

### ✅ Payment Page
- [ ] Order ID displays
- [ ] Order details visible
- [ ] Delivery information correct
- [ ] Button to generate QR displays

### ✅ Success Page (After Payment)
- [ ] Order confirmation message
- [ ] Order number displayed
- [ ] All order details shown
- [ ] Guest information visible
- [ ] Delivery/pickup instructions shown
- [ ] Guest cart cleared
- [ ] Navigation buttons work

---

## Performance Expectations

| Operation | Expected Time |
|-----------|---|
| Load checkout page | <1s |
| Form validation | <100ms |
| Submit order | <2s |
| Load success page | <1s |
| Database query | <500ms |

---

## Next: Enable PayMongo

Once all tests pass, move to `ENABLE_PAYMONGO.md` for:
1. Getting PayMongo API key
2. Adding to `.env.local`
3. Testing QR code generation
4. Testing full payment flow

---

**Happy testing! 🧪**
