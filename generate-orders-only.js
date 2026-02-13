const { MongoClient, ObjectId } = require('mongodb');

// Atlas connection string
const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

const cities = ["Manila", "Quezon City", "Makati", "Cebu", "Davao", "Pasig", "Taguig", "Caloocan"];
const streets = ["Main St", "Church St", "Park Ave", "Rizal St", "Del Pilar St", "Luna St", "Mabini St"];

// Generate orders with pattern: Year 1 (low), Years 2-4 (high), Year 5 (medium)
function generateOrders(books, customers) {
  const orders = [];
  const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const paymentMethods = ["card", "gcash", "paymaya", "cash"];

  // Year 1 (2020) - Low orders: 5-15 per month
  generateOrdersForYear(2020, 5, 15, 0.7);

  // Year 2 (2021) - High orders: 30-50 per month
  generateOrdersForYear(2021, 30, 50, 0.85);

  // Year 3 (2022) - High orders: 35-55 per month
  generateOrdersForYear(2022, 35, 55, 0.87);

  // Year 4 (2023) - High orders: 40-60 per month
  generateOrdersForYear(2023, 40, 60, 0.88);

  // Year 5 (2024) - Medium orders: 20-35 per month
  generateOrdersForYear(2024, 20, 35, 0.80);

  function generateOrdersForYear(year, minPerMonth, maxPerMonth, deliveryRate) {
    for (let month = 0; month < 12; month++) {
      const ordersThisMonth = randomInt(minPerMonth, maxPerMonth);
      
      for (let i = 0; i < ordersThisMonth; i++) {
        const customer = randomItem(customers);
        const numItems = randomInt(1, 5);
        const orderBooks = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const book = randomItem(books);
          const quantity = randomInt(1, 3);
          const price = book.price || parseFloat((Math.random() * 250 + 350).toFixed(2)); // Use book's price or random 350-600
          orderBooks.push({
            bookId: book._id.toString(),
            title: book.title,
            author: book.author,
            price: parseFloat(price),
            quantity: quantity
          });
          subtotal += parseFloat(price) * quantity;
        }

        const shippingFee = subtotal > 500 ? 0 : 50;
        const discount = Math.random() > 0.7 ? parseFloat((subtotal * 0.1).toFixed(2)) : 0;
        const total = subtotal + shippingFee - discount;

        const orderDate = randomDate(
          new Date(year, month, 1),
          new Date(year, month + 1, 0)
        );

        let status = randomItem(orderStatuses);
        const daysSinceOrder = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));
        
        if (Math.random() < deliveryRate && daysSinceOrder > 7) {
          status = "delivered";
        } else if (daysSinceOrder > 3 && daysSinceOrder <= 7) {
          status = randomItem(["processing", "shipped"]);
        } else if (Math.random() > 0.95) {
          status = "cancelled";
        }

        orders.push({
          _id: new ObjectId(),
          userId: customer._id.toString(),
          customerEmail: customer.email,
          customerName: customer.name || `${customer.firstName} ${customer.lastName}`,
          items: orderBooks,
          subtotal: parseFloat(subtotal.toFixed(2)),
          shippingFee: shippingFee,
          discount: discount,
          total: parseFloat(total.toFixed(2)),
          status: status,
          paymentMethod: randomItem(paymentMethods),
          paymentStatus: status === "delivered" ? "paid" : (Math.random() > 0.2 ? "paid" : "pending"),
          shippingAddress: {
            street: `${randomInt(1, 999)} ${randomItem(streets)}`,
            city: randomItem(cities),
            zipCode: `${randomInt(1000, 9999)}`,
            country: "Philippines"
          },
          trackingNumber: `TRK${year}${(month + 1).toString().padStart(2, '0')}${randomInt(100000, 999999)}`,
          notes: Math.random() > 0.8 ? "Please deliver between 9am-5pm" : "",
          createdAt: orderDate,
          updatedAt: new Date(orderDate.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000)
        });
      }
    }
  }

  return orders;
}

// Generate newsletter subscribers over 5 years
function generateNewsletterSubscribers(existingCustomers) {
  const subscribers = [];
  const startDate = new Date('2020-01-01');
  const endDate = new Date('2024-12-31');

  const firstNames = ["John", "Emma", "Michael", "Sophia", "William", "Olivia", "James", "Ava", "Robert", "Isabella"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

  // Add existing customers as some subscribers
  existingCustomers.forEach(customer => {
    if (Math.random() > 0.3) { // 70% of customers subscribe
      subscribers.push({
        _id: new ObjectId(),
        email: customer.email,
        subscribedAt: randomDate(customer.createdAt || startDate, endDate),
        isActive: Math.random() > 0.05
      });
    }
  });

  // Add 400-500 additional unique subscribers
  for (let i = 0; i < 450; i++) {
    subscribers.push({
      _id: new ObjectId(),
      email: `${randomItem(firstNames).toLowerCase()}.${randomItem(lastNames).toLowerCase()}.${i}@email.com`,
      subscribedAt: randomDate(startDate, endDate),
      isActive: Math.random() > 0.1
    });
  }

  return subscribers;
}

// Generate addresses for existing customers
function generateAddresses(customers) {
  const addresses = [];
  
  customers.forEach(customer => {
    const numAddresses = randomInt(1, 3);
    
    for (let i = 0; i < numAddresses; i++) {
      addresses.push({
        _id: new ObjectId(),
        userId: customer._id.toString(),
        name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        phone: customer.phone || `09${randomInt(100000000, 999999999)}`,
        street: `${randomInt(1, 999)} ${randomItem(streets)}`,
        city: randomItem(cities),
        province: randomItem(["Metro Manila", "Cebu", "Davao", "Laguna", "Cavite"]),
        zipCode: `${randomInt(1000, 9999)}`,
        country: "Philippines",
        isDefault: i === 0,
        createdAt: customer.createdAt || new Date('2020-01-01'),
        updatedAt: new Date()
      });
    }
  });

  return addresses;
}

async function seedData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!');

    const db = client.db('bookstore');

    // Get existing data
    console.log('\n📚 Fetching existing books...');
    const books = await db.collection('books').find({}).toArray();
    console.log(`✅ Found ${books.length} books`);

    console.log('\n👥 Fetching existing users...');
    const users = await db.collection('users').find({ role: 'customer' }).toArray();
    console.log(`✅ Found ${users.length} customers`);

    if (books.length === 0) {
      console.log('❌ No books found! Please add books first.');
      return;
    }

    if (users.length === 0) {
      console.log('❌ No customers found! Please add at least one customer.');
      return;
    }

    // Clear only orders, newsletter, and addresses
    console.log('\n🗑️  Clearing orders, newsletter subscribers, and addresses...');
    await db.collection('orders').deleteMany({});
    await db.collection('newsletter_subscribers').deleteMany({});
    await db.collection('addresses').deleteMany({});
    console.log('✅ Cleared!');

    // Generate new data
    console.log('\n📦 Generating orders (5 years of data)...');
    console.log('   Year 2020: Low orders (5-15/month)');
    console.log('   Year 2021: High orders (30-50/month)');
    console.log('   Year 2022: High orders (35-55/month)');
    console.log('   Year 2023: High orders (40-60/month)');
    console.log('   Year 2024: Medium orders (20-35/month)');
    const orders = generateOrders(books, users);
    await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${orders.length} orders`);

    console.log('\n📧 Generating newsletter subscribers...');
    const subscribers = generateNewsletterSubscribers(users);
    await db.collection('newsletter_subscribers').insertMany(subscribers);
    console.log(`✅ Inserted ${subscribers.length} newsletter subscribers`);

    console.log('\n📍 Generating addresses...');
    const addresses = generateAddresses(users);
    await db.collection('addresses').insertMany(addresses);
    console.log(`✅ Inserted ${addresses.length} addresses`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATA GENERATION COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📚 Books (existing): ${books.length}`);
    console.log(`👥 Customers (existing): ${users.length}`);
    console.log(`📦 Orders (new): ${orders.length}`);
    console.log(`📧 Newsletter Subscribers (new): ${subscribers.length}`);
    console.log(`📍 Addresses (new): ${addresses.length}`);
    console.log('\n📊 Orders by year:');
    
    const ordersByYear = orders.reduce((acc, order) => {
      const year = new Date(order.createdAt).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});
    
    Object.keys(ordersByYear).sort().forEach(year => {
      console.log(`   ${year}: ${ordersByYear[year]} orders`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

seedData();
