# Complete Workflow Testing Guide

## 🎯 Objective
Test the entire bookstore system: Signup → Login → Shopping → Checkout → Payment → Admin Management

---

## TEST 1: User Authentication

### 1.1 Signup New User
**URL:** http://localhost:3000/signup

**Test Data:**
```
First Name: Sarah
Last Name: Johnson
Email: sarah.johnson@test.com
Password: TestPassword123
Confirm Password: TestPassword123
```

**Expected Results:**
✅ Form validates all fields
✅ Password length check (min 6 chars)
✅ Passwords match validation
✅ Success message appears
✅ Redirects to /catalog after 2 seconds
✅ New user appears in MongoDB: `bookstore.users`

**Verify in MongoDB Compass:**
- Database: `bookstore`
- Collection: `users`
- Look for email: `sarah.johnson@test.com`
- Password should be hashed (SHA256)

---

### 1.2 Login with New User
**URL:** http://localhost:3000/login

**Test Data:**
```
Email: sarah.johnson@test.com
Password: TestPassword123
```

**Expected Results:**
✅ Login succeeds
✅ Redirects to /catalog
✅ User data stored in localStorage
✅ Navigation shows user is logged in

---

## TEST 2: Shopping Cart

### 2.1 Add Books to Cart
**URL:** http://localhost:3000/catalog

**Actions:**
1. Browse available books
2. Click "Add to Cart" on 2-3 books
3. View cart

**Expected Results:**
✅ Books added to cart
✅ Cart counter updates
✅ Cart shows correct items and prices

---

## TEST 3: Checkout Process

### 3.1 Proceed to Checkout
**URL:** http://localhost:3000/checkout

**Test as Guest (recommended for testing payment flow):**
```
Name: Sarah Johnson
Email: sarah.johnson@test.com
Phone: +639123456789
Address: 123 Main St, Manila
Delivery Method: Store Pickup (or Delivery)
```

**Expected Results:**
✅ Form validates email format
✅ Phone number validates
✅ Address required for delivery
✅ VAT calculated (12%)
✅ Delivery fee added (₱100 if delivery)
✅ Total amount correct

### 3.2 Generate QR Code
**Button:** "Generate QR Code"

**Expected Results:**
✅ QR code displays (image)
✅ Order ID visible
✅ Order saved to MongoDB: `bookstore.orders`
✅ Payment status: `pending`

**Verify in MongoDB Compass:**
- Database: `bookstore`
- Collection: `orders`
- Look for your order with status: `pending`

---

## TEST 4: Payment & Emails

### 4.1 Simulate Payment
**Endpoint:** GET http://localhost:3000/api/test/mock-payment?orderId=YOUR_ORDER_ID

Replace `YOUR_ORDER_ID` with the ID from your order (copy from success page or MongoDB)

**Expected Results in Console:**
```
✅ Order marked as paid
✅ 📧 [EMAIL - DEV MODE] Order Confirmation sent to customer
✅ 📧 [EMAIL - DEV MODE] Staff Alert sent to admin
✅ Both emails logged in dev console
```

**Order Status Should Change:**
- Before: `paymentStatus: "pending"` → `status: "pending"`
- After: `paymentStatus: "paid"` → `status: "confirmed"`

---

## TEST 5: Admin Dashboard

### 5.1 View Orders
**URL:** http://localhost:3000/staff/orders

**Expected Results:**
✅ Page loads
✅ All orders displayed
✅ Order cards show:
   - Customer name
   - Email
   - Status badge (color-coded)
   - Total amount
   - Order date

### 5.2 Expand Order Details
**Action:** Click on any order card

**Expected Results:**
✅ Card expands
✅ Shows itemized list with quantities and prices
✅ Shows delivery address or pickup location
✅ Shows "Mark as [next status]" button

### 5.3 Update Order Status
**For your test order:**
1. Order should be in `confirmed` status
2. Click "Mark as preparing"
3. Wait for update

**Expected Results:**
✅ Button shows loading spinner
✅ Status updates to `preparing`
✅ Card refreshes
✅ 📧 Console shows customer notification email
✅ Email says: "Your order is being prepared"

### 5.4 Continue Status Updates
**Flow:** confirmed → preparing → ready_for_pickup → delivered

**For each transition:**
1. Click the status button
2. Wait for update
3. Check console for customer email

---

## 🔍 Troubleshooting

### Issue: Signup fails with "User already exists"
**Solution:** Use a different email address

### Issue: QR code won't generate
**Solution:** 
- Verify form is filled correctly
- Check console for errors
- Ensure delivery method is selected
- Verify order was created in MongoDB

### Issue: Mock payment doesn't work
**Solution:**
- Copy exact Order ID from MongoDB
- Use full URL: `http://localhost:3000/api/test/mock-payment?orderId=XXXX`
- Check dev server console for errors

### Issue: No emails showing in console
**Solution:**
- Make sure dev server is running
- Check browser console (F12)
- Look for "📧 [EMAIL - DEV MODE]" prefix
- Verify email service is not silently failing

---

## ✅ Success Criteria

All tests pass when:
1. ✅ User can sign up and data saves to MongoDB
2. ✅ User can login with correct credentials
3. ✅ User can add books and proceed to checkout
4. ✅ Guest checkout works without login
5. ✅ QR code generates for payment
6. ✅ Mock payment triggers email notifications
7. ✅ Admin can see and manage orders
8. ✅ Status updates send customer notifications

---

## 📊 Data Check Points

**In MongoDB Compass, verify:**

1. **users collection:**
   - New signup appears with hashed password
   - Role is "customer"

2. **orders collection:**
   - Order created with pending status
   - After mock payment: status changes to confirmed, paymentStatus to paid
   - All order details correct (items, total, customer info)

3. **Check timestamps:**
   - `createdAt`: When order placed
   - `confirmedAt`: When payment received
   - `readyForPickupAt`: When marked ready
   - `shippedAt`: When shipped
   - `deliveredAt`: When delivered
