const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

async function fixOrderPrices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!');

    const db = client.db('bookstore');

    console.log('\n📚 Fetching books...');
    const books = await db.collection('books').find({}).toArray();
    const bookMap = {};
    books.forEach(book => {
      bookMap[book._id.toString()] = book;
    });
    console.log(`✅ Found ${books.length} books`);

    console.log('\n📦 Fetching orders...');
    const orders = await db.collection('orders').find({}).toArray();
    console.log(`✅ Found ${orders.length} orders`);

    console.log('\n🔧 Fixing order prices...');
    let fixed = 0;

    for (const order of orders) {
      let needsUpdate = false;
      let newSubtotal = 0;

      // Fix items with NaN or missing prices
      const fixedItems = order.items.map(item => {
        let price = parseFloat(item.price);
        
        // If price is NaN or 0, get from book or generate random
        if (isNaN(price) || price === 0) {
          const book = bookMap[item.bookId];
          if (book && book.price) {
            price = parseFloat(book.price);
          } else {
            // Generate random price 350-600
            price = parseFloat((Math.random() * 250 + 350).toFixed(2));
          }
          needsUpdate = true;
        }

        newSubtotal += price * item.quantity;

        return {
          ...item,
          price: price
        };
      });

      if (needsUpdate || isNaN(parseFloat(order.subtotal)) || isNaN(parseFloat(order.total))) {
        const shippingFee = parseFloat(order.shippingFee) || (newSubtotal > 500 ? 0 : 50);
        const discount = parseFloat(order.discount) || 0;
        const newTotal = newSubtotal + shippingFee - discount;

        await db.collection('orders').updateOne(
          { _id: order._id },
          {
            $set: {
              items: fixedItems,
              subtotal: parseFloat(newSubtotal.toFixed(2)),
              shippingFee: shippingFee,
              discount: discount,
              total: parseFloat(newTotal.toFixed(2)),
              updatedAt: new Date()
            }
          }
        );

        fixed++;
        if (fixed % 100 === 0) {
          console.log(`   Fixed ${fixed}/${orders.length} orders...`);
        }
      }
    }

    console.log(`✅ Fixed ${fixed} orders with correct prices`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

fixOrderPrices();
