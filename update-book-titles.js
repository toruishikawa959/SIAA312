const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://spadev99_db_user:J1zAkr1wPXDSHJfH@bookstore.umqddpx.mongodb.net/bookstore?retryWrites=true&w=majority&appName=bookstore";

const bookTitles = [
  "The Silent Echo", "Midnight Chronicles", "The Last Horizon", "Whispers in the Dark", 
  "The Crystal Path", "Shadow's Edge", "The Forgotten Kingdom", "Rivers of Time",
  "The Architect's Dream", "Echoes of Yesterday", "The Golden Compass", "Beneath the Surface",
  "The Wanderer's Tale", "Secrets of the Moon", "The Iron Crown", "Dancing with Shadows",
  "The Eternal Flame", "Lost in Translation", "The Broken Circle", "Wings of Destiny",
  "The Crimson Code", "Tales from the Abyss", "The Sapphire Quest", "Voices in the Wind",
  "The Marble Legacy", "Beyond the Veil", "The Sterling Promise", "Dreams of Tomorrow",
  "The Velvet Revolution", "Keeper of Secrets", "The Obsidian Tower", "Fragments of Hope",
  "The Phoenix Rising", "Echoes from Eternity", "The Silver Lining", "Masters of Fate",
  "The Ivory Gate", "Beneath the Stars", "The Emerald Crown", "Tales of Wonder",
  "The Bronze Age", "Whispers of the Past", "The Diamond Heart", "Through the Looking Glass",
  "The Copper Moon", "Shadows of Tomorrow", "The Platinum Dream", "Chronicles of Destiny",
  "The Jade Empire", "Voices of the Ancients", "The Ruby Sword"
];

const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

async function updateBookTitles() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected!');

    const db = client.db('bookstore');

    console.log('\n📚 Fetching books...');
    const books = await db.collection('books').find({}).toArray();
    console.log(`✅ Found ${books.length} books`);

    console.log('\n✏️  Updating book titles and prices...');
    
    const usedTitles = [];
    let updated = 0;

    for (const book of books) {
      // Get a unique title
      let newTitle;
      do {
        newTitle = randomItem(bookTitles);
      } while (usedTitles.includes(newTitle) && usedTitles.length < bookTitles.length);
      
      usedTitles.push(newTitle);

      // Update with new title and price (350-600)
      const newPrice = parseFloat((Math.random() * 250 + 350).toFixed(2));
      
      await db.collection('books').updateOne(
        { _id: book._id },
        { 
          $set: { 
            title: newTitle,
            price: newPrice,
            updatedAt: new Date()
          } 
        }
      );
      
      updated++;
      if (updated % 10 === 0) {
        console.log(`   Updated ${updated}/${books.length} books...`);
      }
    }

    console.log(`✅ Updated ${updated} books with new titles and prices (₱350-600)`);
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

updateBookTitles();
