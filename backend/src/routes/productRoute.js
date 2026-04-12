const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// Public
router.get('/', productController.getProducts); // Lấy danh sách
router.get('/:id', productController.getProductDetails); // Lấy chi tiết

// ADMIN
router.post('/', verifyToken, authorizeRole('ADMIN'), productController.createProduct);
router.put('/:id', verifyToken, authorizeRole('ADMIN'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), productController.deleteProduct);

module.exports = router;