import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bookstore"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("bookstore")

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("books").deleteMany({})
    await db.collection("users").deleteMany({})
    await db.collection("orders").deleteMany({})
    await db.collection("carts").deleteMany({})
    await db.collection("inventoryLogs").deleteMany({})

    // Seed books
    console.log("📚 Seeding books...")
    const booksData = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0743273565",
        price: 12.99,
        description: "A classic American novel set in the Jazz Age.",
        category: "Fiction",
        stock: 50,
        publisher: "Scribner",
        publishDate: new Date("1925-04-10"),
        imageUrl: "https://via.placeholder.com/300x400?text=The+Great+Gatsby",
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0061120084",
        price: 14.99,
        description: "A gripping tale of racial injustice and childhood innocence.",
        category: "Fiction",
        stock: 45,
        publisher: "J.B. Lippincott",
        publishDate: new Date("1960-07-11"),
        imageUrl: "https://via.placeholder.com/300x400?text=To+Kill+a+Mockingbird",
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0451524935",
        price: 13.99,
        description: "A dystopian novel about totalitarianism.",
        category: "Fiction",
        stock: 60,
        publisher: "Signet Classic",
        publishDate: new Date("1949-06-08"),
        imageUrl: "https://via.placeholder.com/300x400?text=1984",
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0316769174",
        price: 15.99,
        description: "A story of adolescence and alienation.",
        category: "Fiction",
        stock: 40,
        publisher: "Little, Brown",
        publishDate: new Date("1951-07-16"),
        imageUrl: "https://via.placeholder.com/300x400?text=The+Catcher+in+the+Rye",
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        isbn: "978-0062316097",
        price: 18.99,
        description: "A sweeping history of humankind.",
        category: "Non-Fiction",
        stock: 35,
        publisher: "Harper",
        publishDate: new Date("2014-09-30"),
        imageUrl: "https://via.placeholder.com/300x400?text=Sapiens",
      },
      {
        title: "Educated",
        author: "Tara Westover",
        isbn: "978-0399590504",
        price: 17.99,
        description: "A memoir about a woman's journey from survivalism to academia.",
        category: "Biography",
        stock: 55,
        publisher: "Random House",
        publishDate: new Date("2018-02-20"),
        imageUrl: "https://via.placeholder.com/300x400?text=Educated",
      },
      {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        isbn: "978-1250295705",
        price: 16.99,
        description: "A psychological thriller with a shocking twist.",
        category: "Thriller",
        stock: 48,
        publisher: "Celadon Books",
        publishDate: new Date("2019-02-05"),
        imageUrl: "https://via.placeholder.com/300x400?text=The+Silent+Patient",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        isbn: "978-0735211292",
        price: 16.99,
        description: "A guide to building better habits and breaking bad ones.",
        category: "Self-Help",
        stock: 70,
        publisher: "Avery",
        publishDate: new Date("2018-10-16"),
        imageUrl: "https://via.placeholder.com/300x400?text=Atomic+Habits",
      },
    ]

    const booksResult = await db.collection("books").insertMany(
      booksData.map((book) => ({
        ...book,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    console.log(`✅ Seeded ${Object.keys(booksResult.insertedIds).length} books`)

    // Seed admin user
    console.log("👥 Seeding users...")
    const crypto = require("crypto")
    const hashPassword = (password: string) =>
      crypto.createHash("sha256").update(password).digest("hex")

    const usersData = [
      {
        email: "admin@sierbosten.com",
        password: hashPassword("admin123"),
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "staff@sierbosten.com",
        password: hashPassword("staff123"),
        firstName: "Staff",
        lastName: "Member",
        role: "staff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "customer@example.com",
        password: hashPassword("customer123"),
        firstName: "John",
        lastName: "Doe",
        role: "customer",
        address: "123 Main St",
        phone: "555-0123",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const usersResult = await db.collection("users").insertMany(usersData)

    console.log(`✅ Seeded ${Object.keys(usersResult.insertedIds).length} users`)

    // Create indexes
    console.log("🔍 Creating indexes...")
    await db.collection("books").createIndex({ title: "text", description: "text" })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("orders").createIndex({ userId: 1 })
    await db.collection("carts").createIndex({ userId: 1 })

    console.log("✅ Indexes created")

    console.log("✅ Database seeded successfully!")
    console.log("\n📋 Credentials for testing:")
    console.log("Admin: admin@sierbosten.com / admin123")
    console.log("Staff: staff@sierbosten.com / staff123")
    console.log("Customer: customer@example.com / customer123")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
