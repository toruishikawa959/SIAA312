# Bookstore Management System

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/laguajamir5-gmailcoms-projects/v0-bookstore-management-system)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/OgroxZMxSJp)

## Overview

A full-stack bookstore management system built with **Next.js 15**, **React 19**, and **MongoDB**.

### Features
- 📚 **Book Catalog** - Browse and search books
- 🛒 **Shopping Cart** - Add/remove items
- 📦 **Order Management** - Place and track orders
- 👥 **User Authentication** - Sign up and login
- 📊 **Admin Dashboard** - Manage inventory and orders
- 👔 **Staff Panel** - Inventory and order management

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup MongoDB
Ensure MongoDB is running locally (via MongoDB Compass or Docker)

### 3. Seed Database
```bash
pnpm seed
```

Test credentials:
- Admin: `admin@sierbosten.com` / `admin123`
- Staff: `staff@sierbosten.com` / `staff123`
- Customer: `customer@example.com` / `customer123`

### 4. Start Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[Backend Setup Guide](./BACKEND_SETUP.md)** - MongoDB, API routes, and database schema
- **[API Documentation](./BACKEND_SETUP.md#-api-routes)** - All available endpoints

## 🏗️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, MongoDB
- **UI Components:** shadcn/ui, Radix UI
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **Analytics:** Vercel Analytics

## 📁 Project Structure

```
app/
  ├── api/
  │   ├── auth/         - Authentication routes
  │   ├── books/        - Book management
  │   ├── cart/         - Shopping cart
  │   ├── orders/       - Order management
  │   └── inventory/    - Inventory management
  ├── admin/            - Admin pages
  ├── staff/            - Staff pages
  └── ...               - User-facing pages
lib/
  ├── db.ts            - MongoDB connection
  ├── types.ts         - TypeScript interfaces
  └── ...
components/
  └── ui/              - shadcn/ui components
scripts/
  └── seed-db.ts       - Database seeding script
```

## 📊 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/books` | Book CRUD operations |
| POST | `/api/auth` | User signup/login |
| GET | `/api/auth` | Get user profile |
| GET/POST/PATCH/DELETE | `/api/cart` | Shopping cart operations |
| GET/POST/PATCH | `/api/orders` | Order management |
| GET/PATCH | `/api/inventory` | Inventory management |

See [BACKEND_SETUP.md](./BACKEND_SETUP.md#-api-routes) for detailed API documentation.

## 🔄 Deployment

Your project is live at:

**[https://vercel.com/laguajamir5-gmailcoms-projects/v0-bookstore-management-system](https://vercel.com/laguajamir5-gmailcoms-projects/v0-bookstore-management-system)**

Continue building your app on:

**[https://v0.app/chat/projects/OgroxZMxSJp](https://v0.app/chat/projects/OgroxZMxSJp)**

## 🛠️ Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
pnpm seed     # Seed database with sample data
```

## 📝 License

This project is automatically synced from [v0.app](https://v0.app).
