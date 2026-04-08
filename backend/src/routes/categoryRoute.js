const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/', categoryController.getCategories);

// Admin mới được thao tác
router.post('/', verifyToken, authorizeRole('ADMIN', categoryController.createCategory));
router.put('/:id', verifyToken, authorizeRole('ADMIN', categoryController.updateCategory));
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), categoryController.deleteCategory);

module.exports = router;