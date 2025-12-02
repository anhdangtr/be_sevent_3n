const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Đăng ký người dùng mới
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Đăng nhập
router.post('/login', login);

module.exports = router;