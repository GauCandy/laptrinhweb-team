const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Đăng nhập có token là được thêm vào giỏ hàng
router.post('/add', verifyToken, cartController.addItemToCart);
router.get('/', verifyToken, cartController.getCart);

module.exports = router;