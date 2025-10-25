const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

(async () => {
  try {
    await client.connect();
    const db = client.db('bookstore');
    
    console.log('\n📦 DATABASE: bookstore');
    console.log('━'.repeat(50));
    
    const collections = ['books', 'carts', 'users', 'orders'];
    
    for (const colName of collections) {
      const count = await db.collection(colName).countDocuments();
      console.log(`\n📋 Collection: ${colName}`);
      console.log(`   Documents: ${count}`);
      
      if (count > 0) {
        const sample = await db.collection(colName).findOne();
        console.log(`   Sample document:`, JSON.stringify(sample, null, 2).split('\n').slice(0, 5).join('\n'));
      }
    }
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Database check complete!');
    await client.close();
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
