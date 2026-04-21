const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { upload } = require('../config/cloudinary');

// Public
router.get('/', productController.getProducts); // Lấy danh sách
router.get('/:id', productController.getProductDetails); // Lấy chi tiết

// ADMIN
router.post('/', verifyToken, authorizeRole('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/:id', verifyToken, authorizeRole('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), productController.deleteProduct);

//==============================================================
// Thêm nhiều ảnh cho sản phẩm làm sau
// POST   /api/products/:id/images        ← thêm 1 ảnh
// DELETE /api/products/:id/images/:imgId ← xoá 1 ảnh
// 1. Làm 2 route backend trước
// 2. Test Postman
// 3. Làm UI quản lý ảnh trong modal
//==============================================================

// ===== Reviews =====
// Khách viết đánh giá cần ( verifyToken)
router.post('/:id/reviews', verifyToken, reviewController.addReview);

// Công khai ai cũng xem được đánh giá
router.get('/:id/reviews', reviewController.getReviews);

module.exports = router;