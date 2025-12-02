// models/EventCategory.js
const mongoose = require('mongoose');

const eventCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Middleware: xóa tất cả events khi xóa category
eventCategorySchema.pre('deleteOne', async function() {
  await mongoose.model('Event').deleteMany({ category: this._id });
});

module.exports = mongoose.model('EventCategory', eventCategorySchema);
