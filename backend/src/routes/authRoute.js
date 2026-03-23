const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('google-auth-library');
const { verifyToken } = require('../middlewares/authMiddleware');

// Đăng nhập , đăng ký
router.post('/register', authController.register);
router.post('/login', authController.login);

// Đăng nhập bằng Google
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// Profile
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;