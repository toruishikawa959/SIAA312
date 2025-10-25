# 🏁 GET STARTED NOW - Step by Step

## What You Need to Do Right Now

> **Estimated time: 3 minutes**

### Step 1️⃣: Open Terminal
Open PowerShell in your project folder:
```
d:\v0-bookstore-management-system
```

### Step 2️⃣: Make Sure MongoDB is Running
1. Open **MongoDB Compass**
2. Ensure it shows: `mongodb://localhost:27017` (connected)

If MongoDB is not running, start it from MongoDB Compass.

### Step 3️⃣: Seed the Database
Run this command:
```bash
pnpm seed
```

You should see:
```
✅ Connected to MongoDB
🧹 Clearing existing data...
📚 Seeding books...
✅ Seeded 8 books
👥 Seeding users...
✅ Seeded 3 users
🔍 Creating indexes
✅ Indexes created
✅ Database seeded successfully!

📋 Credentials for testing:
Admin: admin@sierbosten.com / admin123
Staff: staff@sierbosten.com / staff123
Customer: customer@example.com / customer123
```

### Step 4️⃣: Start Development Server
```bash
pnpm dev
```

You should see:
```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Network:      http://XXX.XXX.X.XXX:3000

✓ Ready in 2.8s
```

### Step 5️⃣: Open Browser
Go to: **http://localhost:3000**

You should see your bookstore homepage! 🎉

---

## 🧪 Test Everything Works

### Test 1: Login
1. Click "Sign In" (or go to `/login`)
2. Use: `admin@sierbosten.com` / `admin123`
3. You should be logged in as admin

### Test 2: View Books
1. Go to `/catalog`
2. You should see 8 books
3. Click on a book to see details

### Test 3: Add to Cart
1. Click "Add to Cart" on any book
2. Go to `/cart`
3. Item should be in cart

### Test 4: Place Order
1. Go to checkout (`/checkout`)
2. Fill in shipping address
3. Place order
4. You should see order confirmation

---

## 📱 Available Test Accounts

```
ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    admin@sierbosten.com
Password: admin123
Access:   Dashboard, Inventory, Users, Orders
URL:      /admin/dashboard

STAFF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    staff@sierbosten.com
Password: staff123
Access:   Orders, Inventory
URL:      /staff/orders

CUSTOMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    customer@example.com
Password: customer123
Access:   Catalog, Cart, Orders
URL:      /catalog
```

---

## 🔌 Test API Directly

### In Terminal, try:

Get all books:
```bash
curl http://localhost:3000/api/books
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "admin@sierbosten.com",
    "password": "admin123"
  }'
```

---

## 📂 What Files Were Added

```
NEW FILES:
├── lib/db.ts                    → MongoDB connection
├── lib/types.ts                 → TypeScript types
├── lib/api-client.ts            → API functions
├── app/api/auth/route.ts        → Login/signup API
├── app/api/books/route.ts       → Books API
├── app/api/cart/route.ts        → Cart API
├── app/api/orders/route.ts      → Orders API
├── app/api/inventory/route.ts   → Inventory API
├── scripts/seed-db.ts           → Database seed
└── .env.local                   → Configuration

NEW DOCS:
├── BACKEND_SETUP.md             → Full API docs
├── SETUP_COMPLETE.md            → What was built
├── QUICK_REFERENCE.md           → Commands
├── BACKEND_SUMMARY.md           → Architecture
└── BACKEND_CHECKLIST.md         → This checklist
```

---

## 🛠️ Common Commands

```bash
# Start development
pnpm dev

# Stop server
Ctrl + C

# Seed database
pnpm seed

# Build project
pnpm build

# View logs
(Check browser console & terminal)
```

---

## 🚨 If Something Doesn't Work

### MongoDB Connection Error
```
❌ Failed to connect to MongoDB
```
**Solution**: 
- Open MongoDB Compass
- Ensure it's connected to `mongodb://localhost:27017`

### Port 3000 Already in Use
```
Port 3000 is in use, trying 3001 instead
```
**Solution**: This is fine! App will run on port 3001 automatically. Go to `http://localhost:3001`

### Seed Script Fails
```
Error: Failed to connect
```
**Solution**: 
1. Check MongoDB is running in Compass
2. Try seeding again: `pnpm seed`

### Login Doesn't Work
```
Invalid email or password
```
**Solution**:
- Make sure you ran `pnpm seed` first
- Use exact credentials: `admin@sierbosten.com` / `admin123`

---

## 📖 Where to Learn More

| Need Help With | Read This |
|---|---|
| How APIs work | `BACKEND_SETUP.md` |
| All commands | `QUICK_REFERENCE.md` |
| What was built | `SETUP_COMPLETE.md` |
| Integration examples | `SETUP_COMPLETE.md#next-steps` |

---

## ✨ Now You Can...

✅ Browse the bookstore
✅ Login with test accounts
✅ Add books to cart
✅ Place orders
✅ View admin dashboard
✅ Manage inventory
✅ Test APIs directly

---

## 🎯 Next: Build Your Own Features

Ready to add more? Here's what you can do:

### 1. Add More Books
Edit `scripts/seed-db.ts` and add to the `booksData` array, then run `pnpm seed`

### 2. Add New Features
Use the API client in `lib/api-client.ts` to fetch data in your components

### 3. Connect Pages
See examples in `SETUP_COMPLETE.md#-next-steps-to-build-frontend-features`

### 4. Customize Design
Edit components in `components/` and pages in `app/`

---

## 💡 Pro Tips

1. **Hard refresh browser** if seeing old data: `Ctrl+Shift+R`
2. **Check browser console** for errors: `F12`
3. **Check terminal** for server errors
4. **MongoDB Compass** is great for viewing data directly
5. **Use cURL** to test APIs without frontend

---

## 🎉 You're Ready!

```bash
# All you need to do now:
pnpm seed    # Run once
pnpm dev     # Start server
```

Then open http://localhost:3000 and explore! 🚀

---

## ❓ Questions?

1. Check `QUICK_REFERENCE.md` for quick answers
2. See `BACKEND_SETUP.md` for API details
3. Check `SETUP_COMPLETE.md` for integration help

---

**Happy coding! 🎊**

Your backend is ready. Your frontend is ready. 

**Time to build something awesome!** ✨
