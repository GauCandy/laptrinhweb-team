const cartService = require('../services/cartService');

const addItemToCart = async (req, res) => {
    try {
        // Lấy userId từ token đã được giải mã bởi middleware verifyToken
        const userId = req.user.userId;

        // Lấy productId và quantity do người dùng gửi lên qua Body
        const { productId, quantity } = req.body;

        if (!productId || !quantity ) {
            return res.status(400).json({ successs: false, message: "Vui lòng cung cấp productId và quantity" });
        }
        const cartItem = await cartService.addToCart(userId, productId, quantity);

        res.status(200).json({
            success: true,
            message: "Đã thêm vào giỏ hàng thành công",
            data: cartItem
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;

        const cartData = await cartService.getCart(userId);

        // Ở đây ta dùng 200 (OK) và trả luôn data đã được xử lý đẹp đẽ
        res.status(200).json({
            success: true,
            data: cartData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
    }
};

module.exports = {
    addItemToCart,
    getCart
};