const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

// Atlas connection string
const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

// Helper functions
const hashPassword = (password) => crypto.createHash("sha256").update(password).digest("hex");

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Book data
const bookCategories = ["Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", "Fantasy", "Thriller", "Biography", "Self-Help", "History"];
const authors = [
  "Jane Austen", "Stephen King", "J.K. Rowling", "George Orwell", "Agatha Christie",
  "Ernest Hemingway", "F. Scott Fitzgerald", "Harper Lee", "Mark Twain", "Virginia Woolf",
  "Gabriel García Márquez", "Toni Morrison", "Leo Tolstoy", "Charles Dickens", "Maya Angelou"
];

const firstNames = ["John", "Emma", "Michael", "Sophia", "William", "Olivia", "James", "Ava", "Robert", "Isabella", 
                     "David", "Mia", "Richard", "Charlotte", "Joseph", "Amelia", "Thomas", "Harper", "Daniel", "Evelyn"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                   "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];

const cities = ["Manila", "Quezon City", "Makati", "Cebu", "Davao", "Pasig", "Taguig", "Caloocan", "Las Piñas", "Parañaque"];
const streets = ["Main St", "Church St", "Park Ave", "Rizal St", "Del Pilar St", "Luna St", "Mabini St", "Aguinaldo Ave", "Bonifacio St", "Quezon Ave"];

// Generate books (50 books)
function generateBooks() {
  const books = [];
  for (let i = 0; i < 50; i++) {
    books.push({
      _id: new ObjectId(),
      title: `Book Title ${i + 1}`,
      author: randomItem(authors),
      category: randomItem(bookCategories),
      price: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      stock: randomInt(10, 100),
      description: `This is a compelling ${randomItem(bookCategories).toLowerCase()} book that will captivate readers from start to finish.`,
      coverImage: `/placeholder-book-${(i % 10) + 1}.jpg`,
      isbn: `978-0-${randomInt(100, 999)}-${randomInt(10000, 99999)}-${randomInt(0, 9)}`,
      publisher: randomItem(["Penguin", "Random House", "HarperCollins", "Simon & Schuster", "Hachette"]),
      publishedDate: randomDate(new Date('2015-01-01'), new Date('2024-01-01')),
      pages: randomInt(150, 600),
      language: "English",
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviewCount: randomInt(5, 500),
      bestseller: Math.random() > 0.7,
      featured: Math.random() > 0.8,
      createdAt: new Date('2020-01-01'),
      updatedAt: new Date()
    });
  }
  return books;
}

// Generate customers (200 customers over 5 years)
function generateCustomers() {
  const customers = [];
  const startDate = new Date('2020-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < 200; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
    
    customers.push({
      _id: new ObjectId(),
      email: email,
      password: hashPassword('password123'),
      firstName: firstName,
      lastName: lastName,
      name: `${firstName} ${lastName}`,
      role: "customer",
      phone: `09${randomInt(100000000, 999999999)}`,
      address: `${randomInt(1, 999)} ${randomItem(streets)}, ${randomItem(cities)}`,
      createdAt: randomDate(startDate, endDate),
      updatedAt: new Date()
    });
  }
  return customers;
}

// Generate newsletter subscribers (500 subscribers over 5 years)
function generateNewsletterSubscribers(customers) {
  const subscribers = [];
  const startDate = new Date('2020-01-01');
  const endDate = new Date('2024-12-31');

  // Add some existing customers
  const customerEmails = customers.slice(0, 100).map(c => ({ email: c.email, date: c.createdAt }));
  
  // Add new subscribers
  for (let i = 0; i < 400; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    subscribers.push({
      _id: new ObjectId(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.news${i}@email.com`,
      subscribedAt: randomDate(startDate, endDate),
      isActive: Math.random() > 0.1
    });
  }

  // Add customer subscribers
  customerEmails.forEach(({ email, date }) => {
    subscribers.push({
      _id: new ObjectId(),
      email: email,
      subscribedAt: date,
      isActive: Math.random() > 0.05
    });
  });

  return subscribers;
}

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
          const price = book.price;
          orderBooks.push({
            bookId: book._id.toString(),
            title: book.title,
            author: book.author,
            price: price,
            quantity: quantity
          });
          subtotal += price * quantity;
        }

        const shippingFee = subtotal > 500 ? 0 : 50;
        const discount = Math.random() > 0.7 ? parseFloat((subtotal * 0.1).toFixed(2)) : 0;
        const total = subtotal + shippingFee - discount;

        const orderDate = randomDate(
          new Date(year, month, 1),
          new Date(year, month + 1, 0)
        );

        // Determine status based on delivery rate and order date
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
          customerName: customer.name,
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

// Generate addresses for customers
function generateAddresses(customers) {
  const addresses = [];
  
  customers.forEach(customer => {
    // Each customer has 1-3 addresses
    const numAddresses = randomInt(1, 3);
    
    for (let i = 0; i < numAddresses; i++) {
      addresses.push({
        _id: new ObjectId(),
        userId: customer._id.toString(),
        name: customer.name,
        phone: customer.phone,
        street: `${randomInt(1, 999)} ${randomItem(streets)}`,
        city: randomItem(cities),
        province: randomItem(["Metro Manila", "Cebu", "Davao", "Laguna", "Cavite"]),
        zipCode: `${randomInt(1000, 9999)}`,
        country: "Philippines",
        isDefault: i === 0,
        createdAt: customer.createdAt,
        updatedAt: new Date()
      });
    }
  });

  return addresses;
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!');

    const db = client.db('bookstore');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await db.collection('books').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('newsletter_subscribers').deleteMany({});
    await db.collection('addresses').deleteMany({});
    console.log('✅ Cleared!');

    // Generate and insert data
    console.log('\n📚 Generating books...');
    const books = generateBooks();
    await db.collection('books').insertMany(books);
    console.log(`✅ Inserted ${books.length} books`);

    console.log('\n👥 Generating customers...');
    const customers = generateCustomers();
    
    // Add default admin, staff, customer
    const defaultUsers = [
      {
        _id: new ObjectId(),
        email: "admin@sierbosten.com",
        password: hashPassword("admin123"),
        firstName: "Admin",
        lastName: "User",
        name: "Admin User",
        role: "admin",
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: "staff@sierbosten.com",
        password: hashPassword("staff123"),
        firstName: "Staff",
        lastName: "Member",
        name: "Staff Member",
        role: "staff",
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        email: "customer@example.com",
        password: hashPassword("customer123"),
        firstName: "John",
        lastName: "Doe",
        name: "John Doe",
        role: "customer",
        phone: "555-0123",
        address: "123 Main St, Manila",
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date()
      }
    ];

    const allUsers = [...defaultUsers, ...customers];
    await db.collection('users').insertMany(allUsers);
    console.log(`✅ Inserted ${allUsers.length} users (${customers.length} customers + 3 default)`);

    console.log('\n📧 Generating newsletter subscribers...');
    const subscribers = generateNewsletterSubscribers(customers);
    await db.collection('newsletter_subscribers').insertMany(subscribers);
    console.log(`✅ Inserted ${subscribers.length} newsletter subscribers`);

    console.log('\n📦 Generating orders (5 years of data)...');
    console.log('   Year 2020: Low orders (5-15/month)');
    console.log('   Year 2021: High orders (30-50/month)');
    console.log('   Year 2022: High orders (35-55/month)');
    console.log('   Year 2023: High orders (40-60/month)');
    console.log('   Year 2024: Medium orders (20-35/month)');
    const orders = generateOrders(books, customers);
    await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${orders.length} orders`);

    console.log('\n📍 Generating addresses...');
    const addresses = generateAddresses(customers);
    await db.collection('addresses').insertMany(addresses);
    console.log(`✅ Inserted ${addresses.length} addresses`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`📚 Books: ${books.length}`);
    console.log(`👥 Users: ${allUsers.length} (${customers.length} customers, 3 staff/admin)`);
    console.log(`📦 Orders: ${orders.length}`);
    console.log(`📧 Newsletter Subscribers: ${subscribers.length}`);
    console.log(`📍 Addresses: ${addresses.length}`);
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

seedDatabase();
