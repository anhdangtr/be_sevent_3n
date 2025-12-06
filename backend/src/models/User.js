const mongoose = require('mongoose');

// When a user saves an event into a folder
const savedEventSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  savedAt: { type: Date, default: Date.now }
});

// Folder that can hold many saved events
const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g. Watch later, Travel, Music...
  createdAt: { type: Date, default: Date.now },
  events: [savedEventSchema]
});

// When a user likes an event (similar to "Favorite" / "Heart")
const interestingEventSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  likedAt: { type: Date, default: Date.now }
});

// USER MODEL
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // ⭐ User folders
  savedFolders: [folderSchema],

  // ⭐ User liked events
  interestingEvents: [interestingEventSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
