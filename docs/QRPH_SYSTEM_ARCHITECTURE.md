# 🎨 QR Ph Integration - Complete System Architecture

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BOOKSTORE APPLICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  /catalog    │  │  /cart       │  │  /checkout               │ │
│  │              │  │              │  │  - Guest form            │ │
│  │ Browse books │→ │ View items   │→ │ - Email, name, phone     │ │
│  │              │  │ from storage │  │ - Delivery/pickup toggle │ │
│  └──────────────┘  └──────────────┘  │ - Address fields         │ │
│                                      │ - Order summary          │ │
│                                      │ (Subtotal+VAT+Delivery)  │ │
│                                      └────────┬─────────────────┘ │
│                                               │                    │
│                                      ┌────────▼───────────────┐   │
│                                      │ /checkout/payment      │   │
│                                      │ - Display QR code      │   │
│                                      │ - Poll payment status   │   │
│                                      │ - Auto redirect         │   │
│                                      └────────┬───────────────┘   │
│                                               │                    │
│                                      ┌────────▼────────────────┐  │
│                                      │ /checkout/success       │  │
│                                      │ - Order confirmed       │  │
│                                      │ - Show all details      │  │
│                                      │ - Clear cart            │  │
│                                      └────────┬────────────────┘  │
│                                               │                    │
└───────────────────────────────────────────────┼────────────────────┘
                                                │
                                                │
                                    ┌───────────▼───────────┐
                                    │   BACKEND API         │
                                    │                       │
                                    │ POST /api/orders      │
                                    │ Create order          │
                                    │                       │
                                    │ POST /api/payment     │
                                    │ Generate QR code      │
                                    │                       │
                                    │ GET /api/payment      │
                                    │ Check status          │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │  PAYMONGO API         │
                                    │                       │
                                    │ /v1/qrph/sources      │
                                    │ ← Generate QR code    │
                                    │ ← Payment status      │
                                    └───────────┬───────────┘
                                                │
                                    ┌───────────▼──────────────┐
                                    │  DATABASES             │
                                    │                        │
                                    │  MongoDB:              │
                                    │  - Orders collection   │
                                    │  - paymentMethod:"qrph"│
                                    │  - paymongoSourceId    │
                                    │                        │
                                    │  localStorage:         │
                                    │  - guestCart items     │
                                    └────────────────────────┘
```

---

## 🔄 Complete Order Flow

```
START
  │
  ├─ FRONTEND: Browse Catalog (/catalog)
  │    │
  │    ├─ User sees list of books
  │    ├─ Fetches from MongoDB
  │    └─ Click to view details
  │
  ├─ FRONTEND: View Cart (/cart)
  │    │
  │    ├─ Read from localStorage (guestCart)
  │    ├─ Show items, quantities, prices
  │    └─ Click "Checkout"
  │
  ├─ FRONTEND: Checkout Form (/checkout)
  │    │
  │    ├─ Form renders with fields:
  │    │  ├─ Email [required]
  │    │  ├─ Full Name [required]
  │    │  ├─ Phone [required]
  │    │  ├─ Delivery/Pickup toggle
  │    │  └─ Address [conditional if delivery]
  │    │
  │    ├─ Real-time Order Summary:
  │    │  ├─ Read guestCart from localStorage
  │    │  ├─ Calculate subtotal = Σ(price × qty)
  │    │  ├─ Calculate tax = subtotal × 0.12
  │    │  ├─ Calculate delivery = (delivery? 100 : 0)
  │    │  └─ Calculate total = subtotal + tax + delivery
  │    │
  │    └─ User clicks "Proceed to Payment"
  │         │
  │         ├─ Validate form:
  │         │  ├─ Email format check
  │         │  ├─ All required fields filled
  │         │  └─ Address if delivery selected
  │         │
  │         └─ POST /api/orders
  │              │
  │              ├─ BACKEND: Validate Request
  │              │  ├─ Check items array
  │              │  ├─ Check guest data provided
  │              │  ├─ Validate books exist in DB
  │              │  └─ Check stock availability
  │              │
  │              ├─ BACKEND: Update Stock
  │              │  └─ Deduct quantities from MongoDB
  │              │
  │              ├─ BACKEND: Create Order
  │              │  ├─ Save to MongoDB.orders:
  │              │  │  ├─ items array
  │              │  │  ├─ guestEmail
  │              │  │  ├─ guestName
  │              │  │  ├─ guestPhone
  │              │  │  ├─ totalAmount
  │              │  │  ├─ deliveryMethod
  │              │  │  ├─ shippingAddress
  │              │  │  ├─ paymentStatus: "pending"
  │              │  │  └─ createdAt
  │              │  │
  │              │  └─ Return: orderId
  │              │
  │              └─ FRONTEND: Redirect
  │                   └─ Go to /checkout/payment?orderId=X
  │
  ├─ FRONTEND: Payment Page (/checkout/payment)
  │    │
  │    ├─ Fetch order from GET /api/orders?orderId=X
  │    │
  │    ├─ Display Order Information:
  │    │  ├─ Order ID
  │    │  ├─ Items (title, qty, price)
  │    │  ├─ Total amount
  │    │  ├─ Delivery method & address
  │    │  └─ Guest email
  │    │
  │    ├─ User clicks "Generate Payment QR Code"
  │    │    │
  │    │    └─ POST /api/payment
  │    │         │
  │    │         ├─ BACKEND: Call PayMongo API
  │    │         │  │
  │    │         │  └─ POST https://api.paymongo.com/v1/qrph/sources
  │    │         │      {
  │    │         │        "data": {
  │    │         │          "attributes": {
  │    │         │            "amount": 99600,          (in cents)
  │    │         │            "billing": {
  │    │         │              "name": "Guest Name",
  │    │         │              "email": "email@example.com"
  │    │         │            },
  │    │         │            "description": "Bookstore Order #...",
  │    │         │            "statement_descriptor": "BOOKSTORE"
  │    │         │          }
  │    │         │        }
  │    │         │      }
  │    │         │
  │    │         ├─ PAYMONGO API: Generate QR
  │    │         │  ├─ Create source object
  │    │         │  ├─ Generate QR code image
  │    │         │  └─ Return: {
  │    │         │      data: {
  │    │         │        id: "src_xxxxx",
  │    │         │        attributes: {
  │    │         │          code_url: "https://...",  ← QR image
  │    │         │          amount: 99600
  │    │         │        }
  │    │         │      }
  │    │         │    }
  │    │         │
  │    │         ├─ BACKEND: Update Order
  │    │         │  ├─ Save paymongoSourceId: "src_xxxxx"
  │    │         │  ├─ Save paymentMethod: "qrph"  ← NEW
  │    │         │  └─ Update createdAt
  │    │         │
  │    │         └─ Return to Frontend:
  │    │              {
  │    │                "success": true,
  │    │                "qrCode": "https://...",
  │    │                "sourceId": "src_xxxxx",
  │    │                "amount": 996,
  │    │                "currency": "PHP",
  │    │                "paymentMethod": "qrph"
  │    │              }
  │    │
  │    ├─ FRONTEND: Display QR Code
  │    │  ├─ Render QR image from URL
  │    │  └─ Show "Scan to pay" message
  │    │
  │    └─ FRONTEND: Poll Payment Status
  │         │
  │         ├─ Every 3 seconds: GET /api/payment?orderId=X
  │         │    │
  │         │    ├─ BACKEND: Check Order Status
  │         │    │  ├─ Query MongoDB for order
  │         │    │  └─ Return: paymentStatus
  │         │    │
  │         │    └─ If paymentStatus === "paid"
  │         │         └─ Redirect to /checkout/success?orderId=X
  │         │
  │         ├─ CUSTOMER: Scans QR with Phone
  │         │    │
  │         │    └─ Enters PIN in payment app
  │         │         │
  │         │         └─ Payment processed by PayMongo
  │         │              │
  │         │              └─ PayMongo updates status to "paid"
  │         │
  │         └─ Frontend detects status change → Redirect
  │
  ├─ FRONTEND: Success Page (/checkout/success)
  │    │
  │    ├─ Fetch order from GET /api/orders?orderId=X
  │    │
  │    ├─ Display Confirmation:
  │    │  ├─ "Order Confirmed! ✓" message
  │    │  ├─ Order ID
  │    │  ├─ All items with quantities
  │    │  ├─ Order total
  │    │  ├─ Delivery method & address
  │    │  ├─ Guest contact info
  │    │  └─ "What's Next?" instructions
  │    │
  │    ├─ FRONTEND: Clear Cart
  │    │  ├─ Call clearGuestCart()
  │    │  └─ Remove items from localStorage
  │    │
  │    ├─ Show Action Buttons:
  │    │  ├─ "Continue Shopping" → /catalog
  │    │  └─ "View All Orders" → /orders
  │    │
  │    └─ ORDER COMPLETE ✓
  │
  END
```

---

## 📊 Data Flow Diagram

```
USER INPUT
   │
   ├─ Email: john@example.com
   ├─ Name: John Doe
   ├─ Phone: +63 9181234567
   ├─ Delivery: Selected
   └─ Address: 123 Main St, Manila
         │
         ▼
   VALIDATION
   └─ All fields valid ✓
         │
         ▼
   FORM SUBMISSION
   └─ POST /api/orders
         │
         ▼
   BACKEND PROCESSING
   │
   ├─ Fetch cart from request
   ├─ Validate books exist
   ├─ Check stock availability
   ├─ Calculate total amount
   └─ Create order in MongoDB
         │
         ▼
   ORDER CREATED
   │
   ├─ _id: ObjectId(...)
   ├─ items: [...]
   ├─ guestEmail: "john@example.com"
   ├─ guestName: "John Doe"
   ├─ guestPhone: "+63 9181234567"
   ├─ totalAmount: 996
   ├─ deliveryMethod: "delivery"
   ├─ shippingAddress: "123 Main St, Manila"
   ├─ paymentStatus: "pending"
   ├─ paymentMethod: "qrph"  ← NEW
   ├─ paymongoSourceId: (pending)
   └─ createdAt: ISODate(...)
         │
         ▼
   PAYMENT INITIATION
   └─ POST /api/payment
         │
         ├─ orderId: "507f1f77bcf86cd799439011"
         ├─ amount: 996
         ├─ description: "Bookstore Order #..."
         └─ email: "john@example.com"
         │
         ▼
   PAYMONGO API CALL
   └─ POST /v1/qrph/sources
         │
         ├─ amount: 99600 (in cents)
         ├─ billing.name: "John Doe"
         └─ billing.email: "john@example.com"
         │
         ▼
   QR CODE GENERATED
   │
   ├─ sourceId: "src_xxxxx"
   ├─ code_url: "https://api.paymongo.com/attachments/..."
   ├─ paymentMethod: "qrph"
   └─ amount: 996 PHP
         │
         ▼
   ORDER UPDATED
   │
   └─ paymongoSourceId: "src_xxxxx"
      paymentMethod: "qrph"
         │
         ▼
   CUSTOMER ACTION
   │
   ├─ Sees QR code on screen
   ├─ Scans with phone (GCash, PayMaya, etc.)
   ├─ Enters PIN
   └─ Payment confirmed by PayMongo
         │
         ▼
   PAYMENT STATUS UPDATED
   │
   └─ paymentStatus: "paid"
         │
         ▼
   ORDER CONFIRMED
   │
   ├─ All details displayed
   ├─ Confirmation sent to email
   ├─ Cart cleared
   └─ Order complete ✓
```

---

## 🎯 Payment Method Flow (Detailed)

```
                    ┌─────────────────────────┐
                    │   QRPH PAYMENT FLOW     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Customer at Payment     │
                    │ Page with Order Info    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Click Generate QR Code  │
                    └────────────┬────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
     ┌────────────┐      ┌────────────┐      ┌────────────┐
     │  GCash     │      │ PayMaya    │      │ Bancnet    │
     │            │      │            │      │            │
     │ Supported  │      │ Supported  │      │ Supported  │
     │ by QR Ph   │      │ by QR Ph   │      │ by QR Ph   │
     └────────────┘      └────────────┘      └────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ PayMongo Generates QR   │
                    │ Image                   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ QR Displayed on Screen  │
                    │ "Scan to pay"           │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Customer Scans QR with  │
                    │ Phone's Payment App     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ App Opens with Amount:  │
                    │ ₱996                    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Customer Enters PIN     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ PayMongo Processes      │
                    │ Payment                 │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Payment Status Updated  │
                    │ to "paid"               │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Frontend Detects        │
                    │ Status Change           │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Redirect to Success     │
                    │ Page                    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Display Confirmation    │
                    │ & Order Details         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ Clear Guest Cart        │
                    │ from localStorage       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ ORDER COMPLETE ✓        │
                    └────────────────────────┘
```

---

## 🔗 Integration Points

```
┌─────────────────┐
│ Frontend (React)│
└────────┬────────┘
         │ HTTP Requests
         │ (JSON)
         ▼
┌─────────────────┐
│ Next.js Backend │
│ /api/orders     │
│ /api/payment    │
└────────┬────────┘
         │ HTTP Requests
         │ (Authenticated)
         ▼
┌──────────────────────┐
│ PayMongo API         │
│ /v1/qrph/sources     │
└────────┬─────────────┘
         │ HTTPS
         ▼
┌──────────────────────┐
│ PayMongo Servers     │
│ Generate QR Code     │
│ Track Payment Status │
└──────────────────────┘

         ↓↓↓ (Parallel)

┌──────────────────────┐
│ MongoDB              │
│ orders collection    │
│ Save/Update orders   │
│ Track paymentMethod  │
└──────────────────────┘

         ↓↓↓ (Parallel)

┌──────────────────────┐
│ Browser localStorage │
│ guestCart items      │
│ Clear on success     │
└──────────────────────┘
```

---

## 📦 Database Schema

```
MongoDB Database: bookstore

Collection: orders
├─ _id: ObjectId
│  └─ Unique identifier
│
├─ Guest Information
│  ├─ guestEmail: String (required)
│  ├─ guestName: String (required)
│  └─ guestPhone: String (required)
│
├─ Order Items
│  └─ items: Array
│     └─ [
│        {
│          bookId: ObjectId,
│          title: String,
│          author: String,
│          quantity: Number,
│          price: Number
│        }
│      ]
│
├─ Amount Details
│  ├─ totalAmount: Number
│  ├─ subtotal: Number
│  ├─ vatAmount: Number
│  ├─ deliveryFee: Number
│  └─ paymentStatus: "pending" | "paid" | "failed"
│
├─ Delivery Information
│  ├─ deliveryMethod: "delivery" | "pickup"
│  └─ shippingAddress: String (if delivery)
│
├─ Payment Information (← NEW)
│  ├─ paymentMethod: "qrph"  ← NEW FIELD
│  ├─ paymongoSourceId: String
│  └─ paymongoAmount: Number
│
└─ Timestamps
   ├─ createdAt: ISODate
   └─ updatedAt: ISODate
```

---

## 🚀 Deployment Architecture

```
DEVELOPMENT
├─ localhost:3001
├─ MongoDB: mongodb://localhost:27017
├─ API Keys: sk_test_...
└─ Environment: .env.local

PRODUCTION
├─ yourdomain.com (HTTPS)
├─ MongoDB: Managed Atlas/Cloud
├─ API Keys: sk_live_...
└─ Environment: Server env vars
```

---

## ✅ Complete Feature Map

```
┌─────────────────────────────────────────┐
│        BOOKSTORE SYSTEM v2.1            │
├─────────────────────────────────────────┤
│                                         │
│  FRONTEND FEATURES                      │
│  ├─ Browse Catalog               ✅    │
│  ├─ View Book Details            ✅    │
│  ├─ Add to Cart (localStorage)   ✅    │
│  ├─ View Cart                    ✅    │
│  ├─ Checkout Form                ✅    │
│  ├─ Delivery/Pickup Toggle       ✅    │
│  ├─ Dynamic Pricing              ✅    │
│  ├─ Payment Page                 ✅    │
│  ├─ QR Display                   ✅    │
│  ├─ Success Page                 ✅    │
│  └─ Mobile Responsive            ✅    │
│                                         │
│  BACKEND FEATURES                       │
│  ├─ Product API                  ✅    │
│  ├─ Order API (Guest)            ✅    │
│  ├─ Payment API (QR Ph)          ✅    │
│  ├─ Stock Management             ✅    │
│  ├─ Error Handling               ✅    │
│  └─ Authentication (Optional)    ✅    │
│                                         │
│  DATABASE FEATURES                      │
│  ├─ Products Collection          ✅    │
│  ├─ Orders Collection            ✅    │
│  ├─ Payment Tracking             ✅    │
│  └─ Stock Management             ✅    │
│                                         │
│  PAYMENT FEATURES                       │
│  ├─ QR Ph Integration            ✅    │
│  ├─ GCash Support                ✅    │
│  ├─ PayMaya Support              ✅    │
│  ├─ Status Polling               ✅    │
│  ├─ Error Handling               ✅    │
│  └─ Payment Tracking             ✅    │
│                                         │
│  DOCUMENTATION                          │
│  ├─ Quick Start Guide            ✅    │
│  ├─ Technical Guides             ✅    │
│  ├─ API Documentation            ✅    │
│  ├─ Testing Procedures           ✅    │
│  ├─ Troubleshooting Guide        ✅    │
│  └─ Code Comments                ✅    │
│                                         │
└─────────────────────────────────────────┘
```

---

**Status:** ✅ **PRODUCTION READY**
**Version:** 2.1 (QR Ph Optimized)
**Last Updated:** Oct 26, 2025

🎉 Your bookstore is complete and ready to go live! 🎉
