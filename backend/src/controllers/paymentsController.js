const paymentService = require("../services/paymentService");

// Khách hàng bấm nút thanh toán
const processPayment = async (req, res) => {
  try {
    const { id } = req.params; // ID đơn hàng
    const { paymentMethod } = req.body;

    const updatedOrder = await paymentService.payOrder(id, paymentMethod);

    res.status(200).json({
      success: true,
      message: "Thanh toán thành công! Đơn hàng đang được xử lý.",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xem lịch sử payment
const adminGetAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không được để trống!" });
    }

    const payment = await paymentService.updatePaymentStatus(id, status);
    res
      .status(200)
      .json({ success: true, message: "Cập nhật thành công", data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  processPayment,
  adminGetAllPayments,
  updatePaymentStatus,
};
