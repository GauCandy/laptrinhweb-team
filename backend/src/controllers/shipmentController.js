const shipmentService = require("../services/shipmentService");

// ADMIN điền thông tin vận chuyển
const adminCreateShipment = async (req, res) => {
  console.log("DỮ LIỆU BACKEND NHẬN ĐƯỢC:", req.body);
  try {
    const { id } = req.params;
    const shipmentData = req.body; // Gồm carrier , trackingNumber...

    const updatedShipment = await shipmentService.updateShipmentInfo(
      id,
      shipmentData,
    );

    res.status(200).json({
      success: true,
      message: "Đã tạo thông tin giao hàng",
      data: updatedShipment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Quản lý Vận chuyển: Lấy danh sách
const adminGetAllShipments = async (req, res) => {
  try {
    // Lấy query từ URL
    const { search, status } = req.query;

    const shipments = await shipmentService.getAllShipments(search, status);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách vận chuyển thành công",
      data: shipments,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  adminCreateShipment,
  adminGetAllShipments,
};
