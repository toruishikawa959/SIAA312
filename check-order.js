const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

async function checkOrder() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('bookstore');

    // Get one order from 12/30/2024
    const order = await db.collection('orders').findOne({
      createdAt: {
        $gte: new Date('2024-12-30'),
        $lt: new Date('2024-12-31')
      }
    });

    if (order) {
      console.log('\n📦 Sample Order from 12/30/2024:');
      console.log('Order ID:', order._id);
      console.log('Status:', order.status);
      console.log('Payment Method:', order.paymentMethod);
      console.log('\nItems:');
      order.items.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.title}`);
        console.log(`     Price: ${item.price} (type: ${typeof item.price})`);
        console.log(`     Quantity: ${item.quantity}`);
        console.log(`     Subtotal: ${item.price * item.quantity}`);
      });
      console.log('\nOrder Totals:');
      console.log('  Subtotal:', order.subtotal, `(type: ${typeof order.subtotal})`);
      console.log('  Shipping:', order.shippingFee, `(type: ${typeof order.shippingFee})`);
      console.log('  Discount:', order.discount, `(type: ${typeof order.discount})`);
      console.log('  Total:', order.total, `(type: ${typeof order.total})`);
    } else {
      console.log('No orders found on 12/30/2024');
    }

  } finally {
    await client.close();
  }
}

checkOrder();
