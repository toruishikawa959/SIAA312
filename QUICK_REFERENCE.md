# 🚀 Quick Reference Guide

## Essential Commands

```bash
# Install dependencies
pnpm install

# Seed database with sample data
pnpm seed

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Test Credentials (After Running `pnpm seed`)

```
📧 Admin User
Email: admin@sierbosten.com
Password: admin123

📧 Staff User
Email: staff@sierbosten.com
Password: staff123

📧 Customer User
Email: customer@example.com
Password: customer123
```

## API Base URL
```
http://localhost:3000/api
```

## Core API Endpoints

### 🔐 Authentication
```
POST   /auth          Login/Signup
GET    /auth?id=ID    Get user profile
```

### 📚 Books
```
GET    /books                 Get all books
GET    /books?id=ID          Get specific book
GET    /books?category=NAME  Filter by category
POST   /books                Create book (admin)
```

### 🛒 Cart
```
GET    /cart?userId=ID       Get user's cart
POST   /cart                 Add item to cart
PATCH  /cart                 Update item quantity
DELETE /cart?userId=ID       Clear cart
```

### 📦 Orders
```
GET    /orders?userId=ID     Get user's orders
GET    /orders?orderId=ID    Get specific order
GET    /orders               Get all orders (admin)
POST   /orders               Create order
PATCH  /orders               Update order status
```

### 📊 Inventory
```
GET    /inventory            Get low stock books
PATCH  /inventory            Adjust stock
```

## Quick Test Endpoints

### Login
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "admin@sierbosten.com",
    "password": "admin123"
  }'
```

### Get Books
```bash
curl http://localhost:3000/api/books
```

### Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "bookId": "BOOK_ID_HERE",
    "quantity": 1
  }'
```

## File Structure

```
bookstore-management-system/
├── app/
│   ├── api/
│   │   ├── auth/route.ts
│   │   ├── books/route.ts
│   │   ├── cart/route.ts
│   │   ├── orders/route.ts
│   │   └── inventory/route.ts
│   ├── admin/
│   ├── staff/
│   ├── catalog/
│   ├── cart/
│   ├── orders/
│   ├── checkout/
│   └── ...
├── lib/
│   ├── db.ts              ← MongoDB connection
│   ├── types.ts           ← TypeScript interfaces
│   └── api-client.ts      ← Frontend API helpers
├── components/
│   ├── navigation.tsx
│   ├── admin-navigation.tsx
│   ├── footer.tsx
│   └── ui/
├── scripts/
│   └── seed-db.ts         ← Database seeding
├── .env.local             ← MongoDB connection string
├── package.json
├── tsconfig.json
├── BACKEND_SETUP.md       ← Full backend docs
├── SETUP_COMPLETE.md      ← Setup summary
└── README.md              ← Main docs
```

## Environment Variables

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/bookstore
DB_NAME=bookstore
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Frontend API Usage Examples

### Fetch Books
```typescript
import { fetchBooks } from "@/lib/api-client"

const books = await fetchBooks()
const fictionBooks = await fetchBooks("Fiction")
```

### User Login
```typescript
import { login } from "@/lib/api-client"

const user = await login("email@example.com", "password123")
localStorage.setItem("user", JSON.stringify(user))
```

### Add to Cart
```typescript
import { addToCart } from "@/lib/api-client"

const updatedCart = await addToCart(userId, bookId, 1)
```

### Create Order
```typescript
import { createOrder } from "@/lib/api-client"

const order = await createOrder(userId, cartItems, "123 Main St")
```

## MongoDB Collections

### books
- _id, title, author, isbn, price, description, category, stock, publisher, publishDate, imageUrl, createdAt, updatedAt

### users
- _id, email (unique), password (hashed), firstName, lastName, role, address, phone, createdAt, updatedAt

### orders
- _id, userId, items[], totalAmount, status, shippingAddress, createdAt, updatedAt

### carts
- _id, userId, items[], updatedAt

### inventoryLogs
- _id, bookId, action, quantity, reason, staff, createdAt

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running via Compass |
| Port 3000 in use | App will use 3001 automatically |
| Build errors | Run `pnpm install` to ensure all deps |
| Seed script fails | Make sure `pnpm install` completed |
| API returns 404 | Verify request URL and HTTP method |
| Hydration errors | Hard refresh browser (Ctrl+Shift+R) |

## Database Seeding

Run once to populate with sample data:
```bash
pnpm seed
```

Creates:
- 8 sample books in various categories
- 3 test users (admin, staff, customer)
- Database indexes for optimal performance

## Next Steps

1. ✅ Run `pnpm seed`
2. ✅ Start dev server: `pnpm dev`
3. ✅ Open http://localhost:3000
4. ✅ Test login with credentials
5. ✅ Build frontend features using API

## Useful Links

- 📖 [Backend Setup Guide](./BACKEND_SETUP.md)
- 📋 [Setup Complete Guide](./SETUP_COMPLETE.md)
- 🎯 [Main README](./README.md)
- 📚 [API Client](./lib/api-client.ts)
- 🗄️ [Types](./lib/types.ts)

## Support

For detailed information on:
- **API endpoints**: See `BACKEND_SETUP.md#-api-routes`
- **Database schema**: See `BACKEND_SETUP.md#-database-schema`
- **Troubleshooting**: See `BACKEND_SETUP.md#-troubleshooting`

---

**Ready to build?** Start with `pnpm dev` and begin integrating APIs with your frontend! 🚀
