const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    try { 
        const userId = req.user.userId; // Giải mã từ token
        const { shippingAddress } = req.body; // Khách hàng gửi địa chỉ giao hàng

        if (!shippingAddress) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp địa chỉ giao hàng!" });
        }

        const newOrder = await orderService.placeOrder(userId, shippingAddress);

        res.status(201).json({
            success: true,
            message: "Đặt hàng thành công!",
            data: newOrder
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Lấy lịch sử đơn hàng
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await orderService.getUserOrders(userId);

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết một đơn hàng
const getOrderById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params; // Lấy id đơn hàng từ url

        const orderDetails = await orderService.getOrderDetails(userId, id);

        res.status(200).json({ success: true, data: orderDetails });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById
}