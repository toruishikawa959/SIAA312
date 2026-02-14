const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

async function fixFieldNames() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!');

    const db = client.db('bookstore');

    console.log('\n📦 Updating order field names...');
    
    // Rename total to totalAmount for all orders
    const result = await db.collection('orders').updateMany(
      { total: { $exists: true } },
      {
        $rename: { 
          total: 'totalAmount'
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} orders`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixFieldNames();
