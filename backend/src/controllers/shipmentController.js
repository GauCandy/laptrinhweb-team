const shipmentService = require("../services/shipmentService");

// ADMIN điền thông tin vận chuyển
const adminCreateShipment = async (req, res) => {
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

module.exports = {
  adminCreateShipment,
};
