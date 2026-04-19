const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', categoryController.getCategories);

// Admin mới được thao tác
router.post('/', verifyToken, upload.single('image'), authorizeRole('ADMIN'), categoryController.createCategory);
router.put('/:id', verifyToken, upload.single('image'), authorizeRole('ADMIN'), categoryController.updateCategory);
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), categoryController.deleteCategory);


module.exports = router;