# 🧪 LIVE TESTING GUIDE - Complete Checkout & QR Payment Flow

## ✅ System Status

```
Dev Server: RUNNING on http://localhost:3001 ✅
PayMongo Test Keys: CONFIGURED ✅
MongoDB: READY ✅
Environment: .env.local loaded ✅

Ready to test complete checkout flow!
```

---

## 📋 Testing Checklist

### Phase 1: Browse & Cart (5 minutes)
- [ ] Open http://localhost:3001
- [ ] Go to /catalog
- [ ] See list of books
- [ ] Click on a book to view details
- [ ] Click "Add to Cart"
- [ ] Verify item appears in cart (localStorage)
- [ ] Go to /cart
- [ ] Verify items display with prices
- [ ] See "Checkout" button

### Phase 2: Guest Checkout Form (5 minutes)
- [ ] Click "Checkout"
- [ ] Fill Email: `test@example.com`
- [ ] Fill Name: `Test User`
- [ ] Fill Phone: `+63 9181234567`
- [ ] See "Delivery" option selected
- [ ] Fill Address:
  - Street: `123 Main St`
  - City: `Manila`
  - Postal: `1000`
- [ ] See Order Summary updates:
  - Subtotal calculates correctly
  - VAT (12%) calculates
  - Delivery fee: ₱100
  - Total = subtotal + VAT + delivery
- [ ] Click "Proceed to Payment"

### Phase 3: Order Creation (5 minutes)
- [ ] System creates order
- [ ] Redirect to /checkout/payment?orderId=X
- [ ] See order ID displayed
- [ ] See order items and prices
- [ ] See delivery information
- [ ] See total amount

### Phase 4: QR Code Generation (10 minutes)
- [ ] Click "Generate Payment QR Code"
- [ ] Wait for QR code to load (should see image)
- [ ] Verify QR code displays in center
- [ ] QR should be scannable looking
- [ ] No errors in browser console (F12)

### Phase 5: MongoDB Verification (5 minutes)
- [ ] Open MongoDB Compass
- [ ] Database: `bookstore`
- [ ] Collection: `orders`
- [ ] Find newest order (highest _id)
- [ ] Verify fields:
  - [x] `guestEmail: "test@example.com"`
  - [x] `guestName: "Test User"`
  - [x] `guestPhone: "+63 9181234567"`
  - [x] `totalAmount: 996` (or similar)
  - [x] `deliveryMethod: "delivery"`
  - [x] `shippingAddress` filled
  - [x] `paymentStatus: "pending"`
  - [x] `paymentMethod: "qrph"` ← NEW FIELD
  - [x] `paymongoSourceId: "src_xxxxx"` ← Should be populated

### Phase 6: Payment Status Check (5 minutes)
- [ ] Still on payment page
- [ ] System polling for payment status (check Network tab)
- [ ] Should see GET requests to /api/payment every 3 seconds
- [ ] Payment status still "pending" (since we didn't actually pay)
- [ ] No errors in console

### Phase 7: Success Page (Optional - Manual)
- [ ] Manually navigate to: `/checkout/success?orderId=X`
  (Replace X with your orderId from payment page)
- [ ] Should see order confirmation page
- [ ] See all order details displayed
- [ ] See guest information
- [ ] See delivery address
- [ ] See "What's Next?" section

---

## 🎯 Detailed Test Scenarios

### Scenario 1: Complete Checkout (Best Case)
```
Start: http://localhost:3001/catalog
Step 1: Add any book to cart
Step 2: Go to /cart → Click "Checkout"
Step 3: Fill form:
        Email: test@example.com
        Name: John Doe
        Phone: +63 9181234567
        [Select] Delivery (+₱100)
        Address: 123 Main, Manila, 1000
Step 4: Click "Proceed to Payment"
Step 5: See payment page with order
Step 6: Click "Generate Payment QR Code"
Step 7: See QR code image
Step 8: Check MongoDB for order with:
        paymentMethod: "qrph"
        paymongoSourceId: populated

Expected: ✅ SUCCESS
All data appears correctly
QR code displays
Order in database with all fields
```

### Scenario 2: Delivery vs Pickup
```
TEST A - DELIVERY:
Step 1: Select "Delivery" in checkout
Step 2: Fill address fields
Step 3: See Fee: ₱100 in summary
Step 4: Proceed to payment
Step 5: Check order: deliveryMethod: "delivery"

TEST B - PICKUP:
Step 1: Select "Store Pickup" in checkout
Step 2: Address fields should HIDE
Step 3: See Fee: ₱0 in summary
Step 4: Proceed to payment
Step 5: Check order: deliveryMethod: "pickup"

Expected: ✅ Both fees calculate correctly
Address fields show/hide based on selection
```

### Scenario 3: Pricing Calculation
```
Items: Book A (₱350) + Book B (₱450)

Without Delivery:
  Subtotal: ₱800
  VAT (12%): ₱96
  Delivery: ₱0
  Total: ₱896

With Delivery:
  Subtotal: ₱800
  VAT (12%): ₱96
  Delivery: ₱100
  Total: ₱996

Test: Switch delivery/pickup toggle
      Watch total update in real-time

Expected: ✅ Calculations correct
Real-time updates work
Totals match expectations
```

---

## 🔍 Browser Console Testing

### Open Developer Tools
```
Press: F12 (Windows)
Go to: Console tab
```

### Check for Errors
```
✅ Should see NO red errors
✅ Should see PayMongo requests logged
✅ Should see order creation success
❌ Should NOT see fetch errors
❌ Should NOT see TypeScript errors
```

### Monitor Network Activity
```
Press: F12 → Network tab
Perform checkout:

Expected requests:
1. POST /api/orders
   └─ Response: orderId: "..."
   └─ Status: 201 Created

2. POST /api/payment
   └─ Response: qrCode: "https://...", paymentMethod: "qrph"
   └─ Status: 201 Created

3. GET /api/payment (every 3 seconds)
   └─ Response: paymentStatus: "pending"
   └─ Status: 200 OK
```

---

## 💾 MongoDB Verification

### Query to Run in MongoDB Compass

```javascript
// Find latest order
db.orders.findOne({}, { sort: { createdAt: -1 } })

// Expected output:
{
  "_id": ObjectId("..."),
  "items": [
    {
      "bookId": ObjectId("..."),
      "title": "Book Title",
      "quantity": 1,
      "price": 350
    }
  ],
  "guestEmail": "test@example.com",
  "guestName": "Test User",
  "guestPhone": "+63 9181234567",
  "totalAmount": 996,
  "subtotal": 800,
  "vatAmount": 96,
  "deliveryFee": 100,
  "deliveryMethod": "delivery",
  "shippingAddress": "123 Main St, Manila 1000",
  "paymentStatus": "pending",
  "paymentMethod": "qrph",           ← NEW
  "paymongoSourceId": "src_xxxxx",   ← Should be populated
  "createdAt": ISODate("2025-10-26T..."),
  "updatedAt": ISODate("2025-10-26T...")
}
```

### Verify Stock Deduction
```javascript
// Check book stock decreased
db.books.findOne({ _id: ObjectId("...") })

// Stock should be reduced by quantity ordered
{
  ...
  "stock": 9  // Was 10, now 9 after order
}
```

---

## 🔐 API Endpoint Testing

### Test with cURL (or Postman)

#### 1. Create Order
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "bookId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "quantity": 1,
        "price": 350
      }
    ],
    "guestEmail": "test@example.com",
    "guestName": "Test User",
    "guestPhone": "+63 9181234567",
    "guestAddress": "123 Main St, Manila",
    "deliveryMethod": "delivery",
    "total": 996
  }'

Expected Response:
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011"
}
```

#### 2. Generate QR Code
```bash
curl -X POST http://localhost:3001/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 996,
    "description": "Bookstore Order #507f1f77bcf86cd799439011",
    "email": "test@example.com"
  }'

Expected Response:
{
  "success": true,
  "sourceId": "src_xxxxx",
  "qrCode": "https://api.paymongo.com/attachments/...",
  "amount": 996,
  "currency": "PHP",
  "paymentMethod": "qrph"
}
```

#### 3. Check Payment Status
```bash
curl -X GET http://localhost:3001/api/payment?orderId=507f1f77bcf86cd799439011

Expected Response:
{
  "paymentStatus": "pending",
  "amount": 996,
  "createdAt": "2025-10-26T..."
}
```

---

## ✅ Test Results

### Complete Success Scenario
```
Flow: Browse → Add → Checkout → Fill Form → Payment → QR Display → Success

Expected Results:
✅ Book displays on /catalog
✅ Add to cart works (localStorage updated)
✅ Cart page shows items
✅ Checkout form displays
✅ Form validation works
✅ Order summary calculates correctly
✅ Delivery fee applies
✅ Order created in MongoDB
✅ Payment page displays order
✅ QR code generates
✅ QR code image displays
✅ API responses show paymentMethod: "qrph"
✅ Stock reduced in MongoDB
✅ No console errors

Overall: 🟢 PASS - Complete checkout flow working
```

### Potential Issues & Solutions

| Issue | Check | Solution |
|-------|-------|----------|
| QR code not showing | Browser console (F12) | Check Network tab for /api/payment response |
| Order not creating | MongoDB Compass | Check /api/orders response in Network tab |
| Form validation fails | Check field values | Ensure all required fields filled |
| Stock not deducting | MongoDB book doc | Check order creation success |
| Wrong total | Verify calculation | Subtotal + VAT (12%) + delivery (if selected) |
| Payment method not recorded | MongoDB order | Verify paymentMethod field exists |

---

## 📊 Full Test Execution Plan

### Time Allocation
```
Setup & Initial Load:     2 minutes
Browse & Add to Cart:     3 minutes
Checkout Form:            5 minutes
Form Submission:          2 minutes
QR Code Generation:       5 minutes
MongoDB Verification:     5 minutes
Error Checking:           3 minutes
─────────────────────────────────
TOTAL:                   25 minutes
```

### Execution Checklist
- [ ] Start dev server (already done ✓)
- [ ] Open http://localhost:3001
- [ ] Add book to cart
- [ ] Complete checkout form
- [ ] Verify order in MongoDB
- [ ] Check API responses in Network tab
- [ ] Verify QR code displays
- [ ] Check browser console for errors
- [ ] Verify all fields in order document

---

## 🎯 What Success Looks Like

### Visual Indicators ✅
- Checkout form displays with all fields
- Form accepts input
- Order summary updates dynamically
- Delivery fee shows correctly
- Payment page loads with order details
- QR code image displays in center
- Browser console shows no red errors

### Data Verification ✅
- Order appears in MongoDB
- Payment method field shows "qrph"
- Payment mongo source ID populated
- All guest information saved
- Delivery method recorded
- Order total calculated correctly

### API Indicators ✅
- POST /api/orders returns 201
- POST /api/payment returns 201
- GET /api/payment returns 200
- Response includes paymentMethod
- Response includes qrCode URL

---

## 🚀 Testing Commands

### Start Fresh Testing
```bash
# Terminal 1: Dev server (already running)
npm run dev

# Terminal 2: Open MongoDB Compass (optional)
# Open browser to: http://localhost:3001

# Terminal 3: Monitor server logs
tail -f logs/app.log  # If logging configured
```

---

## 📞 Troubleshooting During Testing

### "QR code not displaying"
1. Check browser console: F12 → Console
2. Look for errors in /api/payment response
3. Verify PAYMONGO_SECRET_KEY in .env.local
4. Restart dev server: Stop & `npm run dev`

### "Order not created"
1. Check Network tab: POST /api/orders response
2. Check MongoDB: orders collection
3. Verify all form fields filled
4. Check for validation errors in response

### "Form validation fails"
1. Email must contain @
2. All fields must be filled
3. Address required if delivery selected
4. Phone must be filled

### "Stock not deducting"
1. Verify order creation succeeded
2. Check MongoDB books collection
3. Check quantity in order matches

---

## 📝 Testing Notes

**Test Date:** October 26, 2025
**Environment:** Development (localhost:3001)
**PayMongo Keys:** Test Keys (sk_test_)
**Database:** MongoDB Local (mongodb://localhost:27017/bookstore)

**Tester Notes:**
- [ ] All basic flow tested
- [ ] Delivery/Pickup toggle tested
- [ ] Pricing calculations verified
- [ ] MongoDB data verified
- [ ] QR code displays correctly
- [ ] No console errors
- [ ] Ready for production deployment

---

## ✨ Next Steps After Testing

### If Everything Works ✅
1. Continue to next test scenario
2. Test pickup option
3. Test error scenarios
4. Document any issues
5. Ready for production deployment

### If Issues Found ❌
1. Check browser console errors
2. Review API responses
3. Check MongoDB data
4. Refer to troubleshooting section
5. Contact support if needed

---

**Good luck testing! Your bookstore payment system should be fully functional now! 🚀**
