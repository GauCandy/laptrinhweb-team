const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');

// Public
router.get('/', productController.getProducts); // Lấy danh sách
router.get('/:id', productController.getProductDetails); // Lấy chi tiết

// ADMIN
router.post('/', verifyToken, authorizeRole('ADMIN'), productController.createProduct);
router.put('/:id', verifyToken, authorizeRole('ADMIN'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), productController.deleteProduct);

// ===== Reviews =====
// Khách viết đánh giá cần ( verifyToken)
router.post('/:id/reviews', verifyToken, reviewController.addReview);

// Công khai ai cũng xem được đánh giá
router.get('/:id/reviews', reviewController.getReviews);

module.exports = router;