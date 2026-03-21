const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('google-auth-library');

// Đăng nhập , đăng ký
router.post('/register', authController.register);
router.post('/login', authController.login);

// Đăng nhập bằng Google
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

module.exports = router;