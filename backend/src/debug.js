// src/debug.js - File debug tạm thời
const mongoose = require('mongoose');
require('dotenv').config();

const Event = require('./models/Event');
const Category = require('./models/Category');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Lấy tất cả categories
    const categories = await Category.find();
    console.log('=== TẤT CẢ CATEGORIES ===');
    console.log(`Số lượng: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`- ID: ${cat._id} | Name: ${cat.name}`);
    });

    // 2. Lấy tất cả events
    const allEvents = await Event.find();
    console.log(`\n=== TẤT CẢ EVENTS (${allEvents.length} cái) ===`);
    allEvents.forEach(e => {
      console.log(`- Title: ${e.title}`);
      console.log(`  Category Field: ${e.category}`);
      console.log(`  Category Type: ${typeof e.category}`);
      console.log(`  Category Constructor: ${e.category?.constructor?.name}`);
    });

    // 3. Test query - Với String
    const testCategoryId = '6935c87fdf7bfe8ffc73367f';
    console.log(`\n=== TEST QUERY VỚI STRING: ${testCategoryId} ===`);

    const resultsString = await Event.find({ category: testCategoryId });
    console.log(`Kết quả: ${resultsString.length} events`);

    // 4. Test query - Với ObjectId (CÁCH ĐÚNG)
    console.log(`\n=== TEST QUERY VỚI OBJECTID ===`);
    const objectId = new mongoose.Types.ObjectId(testCategoryId);
    const resultsObjectId = await Event.find({ category: objectId });
    console.log(`Kết quả: ${resultsObjectId.length} events`);
    resultsObjectId.forEach(e => {
      console.log(`- ${e.title}`);
    });
    

    // 4. Kiểm tra xem có event nào có category không
    const eventsWithCategory = await Event.find({ category: { $exists: true, $ne: null } });
    console.log(`\n=== EVENTS CÓ CATEGORY ===`);
    console.log(`Số lượng: ${eventsWithCategory.length}`);
    
    if (eventsWithCategory.length > 0) {
      console.log(`Chi tiết event đầu tiên:`);
      const first = eventsWithCategory[0];
      console.log(`- Title: ${first.title}`);
      console.log(`- Category: ${first.category}`);
      console.log(`- Category String: "${first.category.toString()}"`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debug();