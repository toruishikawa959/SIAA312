const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Atlas connection string - UPDATE THIS
const ATLAS_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

// Convert MongoDB extended JSON to regular objects
function convertExtendedJSON(data) {
  return data.map(doc => {
    const converted = {};
    for (const [key, value] of Object.entries(doc)) {
      if (key === '_id' && value.$oid) {
        converted._id = new ObjectId(value.$oid);
      } else if (value && typeof value === 'object' && value.$date) {
        converted[key] = new Date(value.$date);
      } else if (value && typeof value === 'object' && value.$oid) {
        converted[key] = new ObjectId(value.$oid);
      } else {
        converted[key] = value;
      }
    }
    return converted;
  });
}

async function importToAtlas() {
  const client = new MongoClient(ATLAS_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to Atlas!');
    
    const db = client.db('bookstore');
    
    // Import books
    const booksRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.books.json'), 'utf8'));
    const booksData = convertExtendedJSON(booksRaw);
    if (booksData.length > 0) {
      await db.collection('books').deleteMany({});
      await db.collection('books').insertMany(booksData);
      console.log(`✅ Imported ${booksData.length} books`);
    }
    
    // Import users
    const usersRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.users.json'), 'utf8'));
    const usersData = convertExtendedJSON(usersRaw);
    if (usersData.length > 0) {
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(usersData);
      console.log(`✅ Imported ${usersData.length} users`);
    }
    
    // Import orders
    const ordersRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.orders.json'), 'utf8'));
    const ordersData = convertExtendedJSON(ordersRaw);
    if (ordersData.length > 0) {
      await db.collection('orders').deleteMany({});
      await db.collection('orders').insertMany(ordersData);
      console.log(`✅ Imported ${ordersData.length} orders`);
    }
    
    // Import addresses
    const addressesRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.addresses.json'), 'utf8'));
    const addressesData = convertExtendedJSON(addressesRaw);
    if (addressesData.length > 0) {
      await db.collection('addresses').deleteMany({});
      await db.collection('addresses').insertMany(addressesData);
      console.log(`✅ Imported ${addressesData.length} addresses`);
    }
    
    // Import carts
    const cartsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.carts.json'), 'utf8'));
    const cartsData = convertExtendedJSON(cartsRaw);
    if (cartsData.length > 0) {
      await db.collection('carts').deleteMany({});
      await db.collection('carts').insertMany(cartsData);
      console.log(`✅ Imported ${cartsData.length} carts`);
    }
    
    // Import newsletter subscribers
    const newsletterRaw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bookstore.newsletter_subscribers.json'), 'utf8'));
    const newsletterData = convertExtendedJSON(newsletterRaw);
    if (newsletterData.length > 0) {
      await db.collection('newsletter_subscribers').deleteMany({});
      await db.collection('newsletter_subscribers').insertMany(newsletterData);
      console.log(`✅ Imported ${newsletterData.length} newsletter subscribers`);
    }
    
    console.log('\n🎉 All data imported to Atlas successfully!');
    console.log('Your friend can now use the app with this data.');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
  } finally {
    await client.close();
  }
}

importToAtlas();
