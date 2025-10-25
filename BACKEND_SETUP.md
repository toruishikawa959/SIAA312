# 🏪 Bookstore Management System - Backend Setup

This document covers the MongoDB backend implementation for the Bookstore Management System.

## 📚 Table of Contents
- [Setup Instructions](#setup-instructions)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Testing](#testing)

## 🚀 Setup Instructions

### 1. Prerequisites
- MongoDB running locally (via Compass or MongoDB Community Edition)
- Node.js v18+ and pnpm installed

### 2. Environment Configuration
Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/bookstore
DB_NAME=bookstore
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Seed the Database
Run the seed script to populate initial data:

```bash
pnpm seed
```

This will create:
- ✅ 8 sample books
- ✅ 3 test users (admin, staff, customer)
- ✅ Database indexes for optimal queries

**Test Credentials:**
```
Admin: admin@sierbosten.com / admin123
Staff: staff@sierbosten.com / staff123
Customer: customer@example.com / customer123
```

### 4. Start Development Server
```bash
pnpm dev
```

Server runs on `http://localhost:3000`

---

## 📡 API Routes

### Books API
**Base URL:** `/api/books`

#### GET /api/books
Get all books or filter by category
```bash
# Get all books
curl http://localhost:3000/api/books

# Get books by category
curl http://localhost:3000/api/books?category=Fiction

# Get specific book
curl http://localhost:3000/api/books?id=<BOOK_ID>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "price": 12.99,
  "description": "A classic American novel...",
  "category": "Fiction",
  "stock": 50,
  "publisher": "Scribner",
  "publishDate": "1925-04-10",
  "createdAt": "2025-10-25T10:30:00Z",
  "updatedAt": "2025-10-25T10:30:00Z"
}
```

#### POST /api/books
Create a new book (admin only)
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Book",
    "author": "Author Name",
    "isbn": "978-1234567890",
    "price": 19.99,
    "description": "Book description",
    "category": "Fiction",
    "stock": 25,
    "publisher": "Publisher Name",
    "publishDate": "2025-01-01"
  }'
```

---

### Auth API
**Base URL:** `/api/auth`

#### POST /api/auth - Sign Up
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "signup",
    "email": "newuser@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "email": "newuser@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

#### POST /api/auth - Login
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "email": "admin@sierbosten.com",
    "password": "admin123"
  }'
```

#### GET /api/auth
Get user profile
```bash
curl http://localhost:3000/api/auth?id=<USER_ID>
```

---

### Orders API
**Base URL:** `/api/orders`

#### GET /api/orders
Get orders
```bash
# Get all orders (admin)
curl http://localhost:3000/api/orders

# Get user's orders
curl http://localhost:3000/api/orders?userId=<USER_ID>

# Get specific order
curl http://localhost:3000/api/orders?orderId=<ORDER_ID>
```

#### POST /api/orders
Create new order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439012",
    "items": [
      {
        "bookId": "507f1f77bcf86cd799439011",
        "quantity": 2
      }
    ],
    "shippingAddress": "123 Main St, City, State 12345"
  }'
```

#### PATCH /api/orders
Update order status
```bash
curl -X PATCH http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439013",
    "status": "shipped"
  }'
```

---

### Cart API
**Base URL:** `/api/cart`

#### GET /api/cart
Get user's cart
```bash
curl http://localhost:3000/api/cart?userId=<USER_ID>
```

#### POST /api/cart
Add item to cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439012",
    "bookId": "507f1f77bcf86cd799439011",
    "quantity": 1
  }'
```

#### PATCH /api/cart
Update cart item quantity
```bash
curl -X PATCH http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439012",
    "bookId": "507f1f77bcf86cd799439011",
    "quantity": 3
  }'
```

#### DELETE /api/cart
Clear user's cart
```bash
curl -X DELETE http://localhost:3000/api/cart?userId=<USER_ID>
```

---

### Inventory API
**Base URL:** `/api/inventory`

#### GET /api/inventory
Get low stock books (stock < 10)
```bash
curl http://localhost:3000/api/inventory
```

#### PATCH /api/inventory
Update inventory
```bash
curl -X PATCH http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "bookId": "507f1f77bcf86cd799439011",
    "quantity": 5,
    "action": "add",
    "reason": "Restocking",
    "staffId": "507f1f77bcf86cd799439010"
  }'
```

Actions: `add`, `remove`, `adjust`

---

## 🗄️ Database Schema

### Collections

#### books
```typescript
{
  _id: ObjectId,
  title: string,
  author: string,
  isbn: string,
  price: number,
  description: string,
  category: string,
  stock: number,
  publisher: string,
  publishDate: Date,
  imageUrl?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### users
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed SHA256),
  firstName: string,
  lastName: string,
  role: "customer" | "staff" | "admin",
  address?: string,
  phone?: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### orders
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      bookId: ObjectId,
      title: string,
      author: string,
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  status: "pending" | "shipped" | "delivered" | "cancelled",
  shippingAddress: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### carts
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      bookId: ObjectId,
      quantity: number
    }
  ],
  updatedAt: Date
}
```

#### inventoryLogs
```typescript
{
  _id: ObjectId,
  bookId: ObjectId,
  action: "add" | "remove" | "adjust",
  quantity: number,
  reason: string,
  staff?: ObjectId,
  createdAt: Date
}
```

---

## 🧪 Testing

### Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `bookstore` database
4. Browse collections and data

### Using Postman/cURL
See API Routes section above for examples

### Testing the Frontend Integration
1. Start the dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Test authentication and operations

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
❌ Failed to connect to MongoDB
```
**Solution:** Ensure MongoDB is running locally. Start it via MongoDB Compass or:
```bash
mongod --dbpath <path-to-data>
```

### Port Already in Use
```
Port 3000 is in use, trying 3001 instead
```
**Solution:** This is expected. The app will run on port 3001. Change the connection in `.env.local` if needed.

### Seed Script Fails
```
Error: Cannot find module 'ts-node'
```
**Solution:** Run `pnpm install` to ensure all dependencies are installed.

---

## 📋 Next Steps

- [ ] Implement JWT authentication
- [ ] Add input validation with Zod
- [ ] Create middleware for authentication checks
- [ ] Add pagination to API routes
- [ ] Implement search functionality
- [ ] Add rate limiting
- [ ] Create admin dashboard features
- [ ] Add payment processing integration

---

## 📝 Notes

- Passwords are hashed using SHA256 (consider using bcrypt for production)
- All timestamps are stored in UTC
- MongoDB connections are cached for performance
- Automatic stock updates when orders are placed
