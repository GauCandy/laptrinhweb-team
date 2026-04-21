const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // Giải mã từ token
    const { shippingAddress } = req.body; // Khách hàng gửi địa chỉ giao hàng

    if (!shippingAddress) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng cung cấp địa chỉ giao hàng!",
        });
    }

    const newOrder = await orderService.placeOrder(userId, shippingAddress);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: newOrder,
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

// Khách hàng bấm nút thanh toán
const processPayment = async (req, res) => {
  try {
    const { id } = req.params; // ID đơn hàng
    const { paymentMethod } = req.body;

    const updatedOrder = await orderService.payOrder(id, paymentMethod);

    res.status(200).json({
      success: true,
      message: "Thanh toán thành công! Đơn hàng đang được xử lý.",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin xem toàn bộ đơn hàng
const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN đổi trạng thái đơn (Ví dụ: PROCESSING -> SHIPPED)
const adminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(id, status);
    res
      .status(200)
      .json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: updatedOrder,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ADMIN điền thông tin vận chuyển
const adminCreateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body; // Gồm carrier , trackingNumber...

    const updatedShipment = await orderService.updateShipmentInfo(
      id,
      shipmentData,
    );

    // Tiện tay cập nhật luôn trạng thái đơn hàng sang shipped
    await orderService.updateOrderStatus(id, "SHIPPED");

    res
      .status(200)
      .json({
        success: true,
        message: "Đã tạo thông tin giao hàng",
        data: updatedShipment,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xem lịch sử payment
const adminGetAllPayments = async (req, res) => {
  try {
    const payments = await orderService.getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  processPayment,
  adminGetAllOrders,
  adminUpdateStatus,
  adminCreateShipment,
  adminGetAllPayments,
};
