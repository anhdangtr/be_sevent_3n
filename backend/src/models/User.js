// models/User.js
const mongoose = require('mongoose');

const savedEventSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  savedAt: { type: Date, default: Date.now }
});

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  events: [savedEventSchema]
});

const interestingEventSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  likedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },

  // 🔥 Role chỉ có 2 giá trị: admin hoặc user
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  savedFolders: [folderSchema],
  interestingEvents: [interestingEventSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

//test be
//test