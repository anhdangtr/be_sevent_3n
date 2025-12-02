// models/Reminder.js
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reminderTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  isSend: { type: Boolean, default: false }
});

module.exports = mongoose.model('Reminder', reminderSchema);
