# QR Ph Integration Update Guide

## 🎯 Overview

Your PayMongo integration has been updated to use the **correct QR Ph endpoint** as recommended by the PayMongo support team. This ensures proper QR code generation for Philippine payment methods.

---

## 📋 What Changed

### Before (Generic Sources Endpoint)
```typescript
// Old approach - Generic sources endpoint
POST https://api.paymongo.com/v1/sources
type: "gcash"
```

### After (QR Ph Specific Endpoint)
```typescript
// New approach - QR Ph specific endpoint
POST https://api.paymongo.com/v1/qrph/sources
// Proper QR code generation for Philippines
```

---

## 🔄 Updated Endpoints

### POST `/api/payment` - Generate QR Ph Code

**Updated Payload Structure:**
```json
{
  "data": {
    "attributes": {
      "amount": 99600,
      "billing": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "description": "Bookstore Order #507f1f77bcf86cd799439011",
      "statement_descriptor": "BOOKSTORE"
    }
  }
}
```

**Updated Response:**
```json
{
  "success": true,
  "sourceId": "src_xxxxx",
  "qrCode": "https://api.paymongo.com/attachments/...",
  "amount": 996,
  "currency": "PHP",
  "paymentMethod": "qrph"
}
```

**Key Changes:**
- Uses `/v1/qrph/sources` endpoint instead of `/v1/sources`
- Response field: `code_url` (QR Ph specific) instead of `source_url`
- Added `paymentMethod: "qrph"` to order document
- Removed redirect URLs (QR Ph doesn't use redirects)
- Simplified billing structure

---

## 🛠 Implementation Details

### app/api/payment/route.ts

**What's Different:**

1. **Endpoint Change**
   ```typescript
   // OLD
   const sourceResponse = await fetch("https://api.paymongo.com/v1/sources", ...)
   
   // NEW
   const qrPhResponse = await fetch("https://api.paymongo.com/v1/qrph/sources", ...)
   ```

2. **Request Body Simplified**
   ```typescript
   // NEW - Cleaner structure
   body: JSON.stringify({
     data: {
       attributes: {
         amount: Math.round(amount * 100),
         billing: {
           name: description || "Bookstore Order",
           email: email || "customer@bookstore.ph",
         },
         description: `Bookstore Order #${orderId}`,
         statement_descriptor: "BOOKSTORE",
       },
     },
   }),
   ```

3. **Response Field Change**
   ```typescript
   // OLD
   qrCode: source.attributes.source_url || source.attributes.redirect_url
   
   // NEW
   qrCode: qrSource.attributes.code_url // QR Ph specific field
   ```

4. **Order Document Update**
   ```typescript
   $set: {
     paymongoSourceId: qrSource.id,
     paymentMethod: "qrph",  // NEW - Track payment method
     updatedAt: new Date(),
   }
   ```

---

## 🧪 Testing Your QR Ph Integration

### Step 1: Get Test API Keys

1. Go to https://dashboard.paymongo.com/developers
2. Copy your test secret key (starts with `sk_test_`)
3. Add to `.env.local`:
   ```
   PAYMONGO_SECRET_KEY=sk_test_YOUR_KEY_HERE
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Test Full Flow

```
1. Go to http://localhost:3001/catalog
2. Add book to cart
3. Go to /cart → Click "Checkout"
4. Fill guest form (email, name, phone, delivery, address)
5. Click "Proceed to Payment"
6. System should create order in MongoDB
7. Navigate to /checkout/payment?orderId=X
8. Click "Generate Payment QR Code"
   ✓ Should display QR code image
   ✓ Check browser console for no errors
   ✓ Check order in MongoDB for paymongoSourceId and paymentMethod: "qrph"
```

### Step 4: Verify in MongoDB

Open MongoDB Compass and run query on orders collection:
```javascript
db.orders.findOne({ 
  paymentMethod: "qrph",
  guestEmail: "your-test@example.com"
})
```

Expected output:
```javascript
{
  _id: ObjectId(...),
  items: [...],
  guestEmail: "your-test@example.com",
  guestName: "Test User",
  guestPhone: "+63 9181234567",
  totalAmount: 996,
  paymentStatus: "pending",
  deliveryMethod: "delivery",
  shippingAddress: "123 Main St, Manila",
  paymongoSourceId: "src_xxxxx",
  paymentMethod: "qrph",  // ← This should be "qrph"
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## 🎯 Important Testing Notes (From PayMongo Support)

> **⚠️ CRITICAL:** When testing QR Ph with test API keys, the generated QR codes are **LIVE codes**. 
> 
> This means:
> - ✅ You can generate test QR codes
> - ❌ **Do NOT complete actual payments** during testing
> - ✅ Just verify the QR code displays correctly
> - ✅ Verify order data saves to MongoDB properly

---

## 🔐 API Key Types

### Test Keys (Development)
- **Public Key:** `pk_test_xxxxx`
- **Secret Key:** `sk_test_xxxxx`
- **Use:** Development and testing
- **QR Codes:** Live but for testing
- **Payments:** Safe to test (no real money)

### Live Keys (Production)
- **Public Key:** `pk_live_xxxxx`
- **Secret Key:** `sk_live_xxxxx`
- **Use:** Production environment only
- **QR Codes:** Live and processing real payments
- **Payments:** Real money transactions

---

## 📊 QR Ph Payment Flow

```
Customer Checkout
    ↓
Fill Guest Information
    ↓
Submit Order
    ↓
POST /api/payment
    ↓
PayMongo API v1/qrph/sources
    ↓
Generate QR Code Image
    ↓
Display QR to Customer
    ↓
Customer Scans QR
    ↓
Enter PIN in Payment App
    ↓
Payment Confirmation
    ↓
System Polls Status
    ↓
Order Confirmed
    ↓
Success Page
```

---

## 🚀 Deployment Checklist

### Before Deploying to Production

- [ ] Test with test keys (sk_test_)
- [ ] Verify QR codes display correctly
- [ ] Verify orders save to MongoDB
- [ ] Verify payment status polling works
- [ ] Test on mobile devices
- [ ] Test error handling (bad amount, missing email, etc.)

### Before Going Live

- [ ] Get PayMongo live keys (sk_live_)
- [ ] Update `.env.local` on production server:
  ```
  PAYMONGO_SECRET_KEY=sk_live_YOUR_LIVE_KEY
  NEXT_PUBLIC_BASE_URL=https://yourdomain.com
  ```
- [ ] Run production build: `npm run build`
- [ ] Test one small payment
- [ ] Monitor error logs
- [ ] Have support contact ready

---

## 🛠 Troubleshooting

### Issue: "QR code not displaying"

**Solution:**
1. Check browser console for fetch errors
2. Verify `PAYMONGO_SECRET_KEY` is set in `.env.local`
3. Verify API key is not expired
4. Check Network tab - PayMongo API response

### Issue: "Order creates but no QR code"

**Check:**
```bash
# In MongoDB Compass, look for paymongoSourceId
db.orders.findOne({ guestEmail: "your@email.com" })
```

If `paymongoSourceId` is missing:
- PayMongo API request failed
- Check browser console errors
- Check PayMongo API status

### Issue: "Payment status not updating"

**Solution:**
1. Verify polling is working (should see GET requests every 3 seconds)
2. Check Network tab
3. Manually check order in MongoDB:
   ```javascript
   db.orders.findOne({ _id: ObjectId("...") })
   ```

---

## 📚 Additional Resources

### Official PayMongo Documentation
- **Main Docs:** https://developers.paymongo.com/docs
- **Dashboard:** https://dashboard.paymongo.com/developers
- **API Reference:** https://developers.paymongo.com/reference/post_sources

### QR Ph Specific
- QR Ph generates QR codes for all major Philippine payment apps
- Works with GCash, PayMaya, bancnet, and more
- No redirect URLs needed
- Stateless payment (polling for status)

---

## 💡 Next Steps

1. **Immediate:** Test with test API keys
2. **Verify:** QR codes display, orders save
3. **Monitor:** Check MongoDB for payment method tracking
4. **Launch:** Switch to live keys when ready
5. **Support:** Refer to PayMongo dashboard for account status

---

## ✅ Verification Checklist

After implementing QR Ph integration:

- [ ] API endpoint updated to use `/v1/qrph/sources`
- [ ] Response parsing updated for `code_url`
- [ ] Order document includes `paymentMethod: "qrph"`
- [ ] `.env.local` has `PAYMONGO_SECRET_KEY`
- [ ] Development server running
- [ ] QR code displays on payment page
- [ ] Orders save with `paymongoSourceId`
- [ ] Orders save with `paymentMethod: "qrph"`
- [ ] No console errors
- [ ] Mobile responsive

---

## 🎉 You're Ready!

Your bookstore is now using the official QR Ph endpoint as recommended by PayMongo support team. This ensures:

✅ Proper QR code generation
✅ Better compatibility with Philippine payment apps
✅ Official support and updates
✅ Production-ready integration

**Test it out and let us know if you hit any issues!**
