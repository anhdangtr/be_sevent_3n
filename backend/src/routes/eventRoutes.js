// src/routes/eventRoutes.js

const express = require('express');
const { 
  getAllEvents, 
  getEventById, 
  getTrendingEvents,
  createEvent, 
  updateEvent, 
  deleteEvent,
  checkIfUserLiked,
  checkIfUserSaved,
  toggleLikeEvent,
  toggleSaveEvent
} = require('../controllers/eventController');

const auth = require('../middleware/authMiddleware');

const router = express.Router();

// ===== PUBLIC ROUTES (không cần auth) =====
router.get('/', getAllEvents);                 // Lấy tất cả events (có pagination)
router.get('/trending', getTrendingEvents);    // Lấy events nổi bật

// ===== PROTECTED ROUTES (cần auth) =====
// Chi tiết event - phải để TRƯỚC route parameters khác
router.get('/:eventId', auth, getEventById);   

// Check status routes
router.get('/:eventId/check-liked', auth, checkIfUserLiked); 
router.get('/:eventId/check-saved', auth, checkIfUserSaved);

// Action routes
router.post('/:eventId/toggle-like', auth, toggleLikeEvent);
router.post('/:eventId/toggle-save', auth, toggleSaveEvent);

// ===== ADMIN ROUTES (cần auth + admin role - nên xử lý ở middleware) =====
router.post('/', auth, createEvent);           // Tạo event mới
router.put('/:eventId', auth, updateEvent);    // Cập nhật event
router.delete('/:eventId', auth, deleteEvent); // Xóa event

module.exports = router;