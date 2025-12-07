const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  saveEvent,
  getSavedEvents,
  updateSavedEvent,
  deleteSavedEvent,
  getFolderList,
  createFolder,
  getSavedEventsByFolder
} = require('../controllers/savedEventController');


// Save event
router.post('/', auth, saveEvent);

// Get all saved events
router.get('/', auth, getSavedEvents);

// Move event
router.put('/:eventId', auth, updateSavedEvent);

// Delete saved event
router.delete('/:eventId', auth, deleteSavedEvent);

// Get folder names
router.get('/get-folders', auth, getFolderList);

// Get events by folder
router.get('/folder/:folderName', auth, getSavedEventsByFolder);

// Create new folder
router.post('/post-folders', auth, createFolder);

module.exports = router;
