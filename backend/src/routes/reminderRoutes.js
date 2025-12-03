const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createReminder,
  getReminders,
  deleteReminder,
  updateReminder
} = require('../controllers/reminderController');

// Get all reminders for an event by logged-in user
router.get('/:eventId', auth, getReminders);

// Create a new reminder
router.post('/', auth, createReminder);

// Update a reminder
router.put('/:reminderId', auth, updateReminder);

// Delete a reminder
router.delete('/:reminderId', auth, deleteReminder);

module.exports = router;
