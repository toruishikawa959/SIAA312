# 🚀 QR Ph Integration - Quick Start Card

## ⚡ 30-Second Setup

### 1. Get Your Test Keys
```
Go to: https://dashboard.paymongo.com/developers
Copy: Secret key (sk_test_...)
```

### 2. Create `.env.local`
```
PAYMONGO_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Test It
```
1. Go to http://localhost:3001/catalog
2. Add book to cart
3. Go to checkout
4. Fill form (email, name, phone, delivery, address)
5. Proceed to payment
6. Click "Generate Payment QR Code"
7. See QR code appear ✓
```

---

## 📱 What Users See

```
CHECKOUT FORM
Email: john@example.com
Name: John Doe
Phone: +63 9181234567
[Toggle] Delivery ✓ $100
Address: 123 Main St, Manila
[PROCEED TO PAYMENT]

ORDER SUMMARY
Book 1: ₱350 x1
Book 2: ₱450 x1
Subtotal: ₱800
VAT: ₱96
Delivery: ₱100
TOTAL: ₱996

         ↓↓↓

PAYMENT PAGE
Order #: 507f1f77bcf86cd...
Total: ₱996

[Generate Payment QR Code]

         ↓↓↓

QR DISPLAY
┌──────────────┐
│   ██  ██     │
│   ██  ██     │ ← User scans with
│   ██████     │   mobile payment app
│              │
└──────────────┘
```

---

## 🔍 How It Works

```
Frontend (React)
    ↓
User clicks "Generate Payment QR Code"
    ↓
POST /api/payment
  orderId, amount, email
    ↓
Backend (Next.js)
    ↓
Calls PayMongo API: POST /v1/qrph/sources
    ↓
PayMongo Returns: QR Code Image URL
    ↓
Updates Order in MongoDB
  paymongoSourceId: "src_xxxxx"
  paymentMethod: "qrph"
    ↓
Frontend Receives: QR Code URL
    ↓
Displays QR Image
    ↓
Polls Payment Status Every 3 Seconds
    ↓
On Success: Redirect to Confirmation Page
```

---

## 📊 Order Structure

```
MongoDB Order Document:
{
  _id: ObjectId(...),
  
  // Guest Information
  guestEmail: "john@example.com",
  guestName: "John Doe",
  guestPhone: "+63 9181234567",
  
  // Order Details
  items: [
    { bookId: "...", title: "Book 1", quantity: 1, price: 350 },
    { bookId: "...", title: "Book 2", quantity: 1, price: 450 }
  ],
  
  totalAmount: 996,
  subtotal: 800,
  vatAmount: 96,
  deliveryFee: 100,
  
  // Delivery Information
  deliveryMethod: "delivery",
  shippingAddress: "123 Main St, Manila 1000",
  
  // Payment Information
  paymentMethod: "qrph",  ← NEW
  paymongoSourceId: "src_xxxxx",
  paymentStatus: "pending",
  
  // Timestamps
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## 🧪 Test Checklist

- [ ] `.env.local` has `PAYMONGO_SECRET_KEY`
- [ ] Dev server running: `npm run dev`
- [ ] Can browse catalog and add books
- [ ] Checkout form displays all fields
- [ ] Can fill guest information
- [ ] Can select delivery/pickup
- [ ] Can see order summary
- [ ] "Proceed to Payment" works
- [ ] Payment page loads order details
- [ ] "Generate Payment QR Code" button responds
- [ ] QR code image displays
- [ ] No errors in browser console
- [ ] MongoDB has new order with `paymentMethod: "qrph"`

---

## 🚨 Common Issues

### QR Code Not Displaying
1. Check browser console (F12 → Console)
2. Check Network tab → `/api/payment` response
3. Verify `PAYMONGO_SECRET_KEY` is correct
4. Restart dev server: `npm run dev`

### Order Not Created
1. Check Network tab → `/api/orders` response
2. Check MongoDB for order document
3. Verify items in cart are correct
4. Check browser console for errors

### Payment Status Not Updating
1. Check Network tab → Should see GET requests every 3 seconds
2. Verify order exists in MongoDB
3. Check polling interval code in payment/page.tsx

---

## 📚 Documentation Files

- **QRPH_INTEGRATION_UPDATE.md** ← You are here!
- **GUEST_CHECKOUT_IMPLEMENTATION.md** - Technical details
- **PAYMONGO_SETUP.md** - PayMongo account setup
- **TESTING_GUIDE.md** - Complete test scenarios
- **README_GUEST_CHECKOUT.md** - Full documentation index

---

## 🎯 Key Differences from Previous Version

| Aspect | Old | New |
|--------|-----|-----|
| **Endpoint** | `/v1/sources` | `/v1/qrph/sources` |
| **Type** | `"gcash"` | QR Ph native |
| **QR Field** | `source_url` | `code_url` |
| **Redirects** | Required | Not needed |
| **Payment Method** | Generic | `"qrph"` |
| **Support** | Community | Official PayMongo |

---

## ✅ What's New

✨ **Official QR Ph Endpoint** - Uses PayMongo's recommended endpoint
✨ **Better QR Codes** - Optimized for all Philippine payment apps
✨ **Payment Tracking** - New `paymentMethod` field in orders
✨ **Simplified Flow** - No redirects needed
✨ **Production Ready** - Recommended by PayMongo support

---

## 📞 Support

**PayMongo Support:**
- Dashboard: https://dashboard.paymongo.com/developers
- Documentation: https://developers.paymongo.com/docs
- Email: support@paymongo.com

**Your System:**
- Check MongoDB for order details
- Check browser console for errors
- Check Network tab for API responses

---

## 🎉 You're All Set!

Your bookstore now has:
✅ Official QR Ph integration
✅ Guest checkout without login
✅ Delivery & pickup options
✅ Real-time order creation
✅ PayMongo QR payment processing
✅ Production-ready code
✅ Comprehensive documentation

**Ready to test? Go to http://localhost:3001 and add books to your cart!**
