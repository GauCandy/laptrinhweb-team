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

const updateItemQuantity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params; // Lấy itemId từ trên url
        const { quantity } = req.body; // Lấy quantity mới từ body

        // Rào lỗi nếu client quân gửi chữ quantity
        if (quantity === undefined) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp số lượng (quantity) mới!"});
        }

        const updatedItem = await cartService.updateCartItem(userId, itemId, quantity);

        res.status(200).json({
            success: true,
            message: "Cập nhật số lượng thành công",
            data: updatedItem
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.massage });
    }
};

const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { itemId } = req.params; // Lấy Id của món hàng trên URL

        await cartService.removeCartItem(userId, itemId);

        res.status(200).json({
            success: true,
            message: "Đã xóa sản phẩm khỏi giỏ hàng thành công!"
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    addItemToCart,
    getCart,
    updateItemQuantity,
    removeItemFromCart
};