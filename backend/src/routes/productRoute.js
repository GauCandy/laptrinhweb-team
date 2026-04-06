const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('google-auth-library');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tuyến đường 1: Chỉ cần đăng nhập là vào được (Khách + Admin đều OK)
router.get('/profile', verifyToken, authController.getProfile);

// Tuyến đường 2: BẮT BUỘC PHẢI LÀ ADMIN MỚI VÀO ĐƯỢC
router.post('/products', verifyToken, authorizeRole('ADMIN'), productController.createProduct);

module.exports = router;