import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables")
}

const uri = process.env.MONGODB_URI
const options = {}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(uri, options)
    await client.connect()

    const db = client.db(process.env.DB_NAME || "bookstore")

    cachedClient = client
    cachedDb = db

    console.log("✅ Connected to MongoDB")

    return { client, db }
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log("✅ Disconnected from MongoDB")
  }
}

export function getDatabase(): Db {
  if (!cachedDb) {
    throw new Error("Database not connected. Call connectToDatabase() first.")
  }
  return cachedDb
}
