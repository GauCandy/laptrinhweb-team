const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.post('/logout', authController.logout);

// Lấy thông tin profile
router.get('/profile', authController.getProfile);

// Cập nhật profile
router.put('/profile', authController.updateProfile);

module.exports = router;