const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Hai trạm kiểm soát 
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Áp dụng trạm kiểm soát cho toàn bộ các route bên dưới
// 1. Phải đăng nhập (verifyToken)
// 2. Phải là Admin (authorizeRole)
router.use( verifyToken, authorizeRole('ADMIN'));

router.get('/users', userController.getAllUsers);
router.put('/users/:id/rolr', userController.updateUserRole);

module.exports = router;