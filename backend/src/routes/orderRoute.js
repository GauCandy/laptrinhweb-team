const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Chỉ cần đăng nhập là đặt được hàng
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getOrderById);

module.exports = router;