const express = require('express');
const { 
  getAllEvents, 
  getEventById, 
  getTrendingEvents,
  createEvent, 
  updateEvent, 
  deleteEvent,
  likeEvent,
  saveEvent,
  checkIfUserLiked,
  toggleLikeEvent
} = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware'); // Middleware xác thực JWT

const router = express.Router();

// Public Routes (không cần auth)
router.get('/', getAllEvents);                    // Lấy tất cả events với pagination
router.get('/trending', getTrendingEvents);       // Lấy events nổi bật
router.get('/:eventId', auth, getEventById);            // Lấy chi tiết event theo ID

// Check if user liked the event (protected route)
router.get('/:eventId/check-like', auth, checkIfUserLiked);
// Toggle like/unlike event (protected route)
router.post('/:eventId/toggle-like', auth, toggleLikeEvent);

// Private Routes (cần auth), dành cho admin
router.post('/', auth, createEvent);              // Tạo event mới
router.put('/:eventId', auth, updateEvent);            // Cập nhật event
router.delete('/:eventId', auth, deleteEvent);         // Xóa event
router.post('/:eventId/like', auth, likeEvent);        // Like event
router.post('/:eventId/save', auth, saveEvent);        // Save event

module.exports = router;