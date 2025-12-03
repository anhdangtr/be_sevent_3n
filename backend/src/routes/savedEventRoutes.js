const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  saveEvent,
  getSavedEvents,
  deleteSavedEvent,
  updateSavedEvent
} = require('../controllers/savedEventController');

// Get all saved events for logged-in user
router.get('/', auth, getSavedEvents);

// Save an event
router.post('/', auth, saveEvent);

// Update a saved event (e.g., change folder name)
router.put('/:savedEventId', auth, updateSavedEvent);

// Delete a saved event
router.delete('/:savedEventId', auth, deleteSavedEvent);

module.exports = router;
