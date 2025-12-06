// models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reminderDateTime: { type: Date, required: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  isSent: { type: Boolean, default: false }
});

// Index to enforce unique reminder times per user per event
reminderSchema.index({ userId: 1, eventId: 1, reminderDateTime: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);