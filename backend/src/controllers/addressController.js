const addressService = require('../services/addressService');

/**
 * Thêm địa chỉ mới
 */
const createAddress = async (req, res) => {
  try {
    console.log("=== DỮ LIỆU TỪ TOKEN GIẢI MÃ ĐƯỢC ===");
    console.log(req.user);
    // req.user được gán từ middleware verifyToken
    const userId = req.user.userId; 
    const addressData = req.body; // { address: "...", phone: "..." }

    if (!addressData.address || !addressData.phone) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp đủ địa chỉ và số điện thoại" });
    }

    const newAddress = await addressService.createAddress(userId, addressData);
    
    res.status(201).json({ 
      success: true, 
      message: "Thêm địa chỉ thành công", 
      data: newAddress 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server: " + error.message });
  }
};

const getAddresses = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addresses = await addressService.getUserAddresses(userId);

        res.status(200).json({ success: true, data: addresses});
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi Server: " + error.message });
    }
};

/**
 * Cập nhật địa chỉ
 */
const updateAddress = async (req, res) => {
    try {
            const userId = req.user.userId;
            const addressId = req.params.id; // lấy id từ url (vd: /api/address/5)
            const addressData = req.body;

            const updateAddress = await addressService.updateAddress(userId, addressId, addressData);

            res.status(200).json({
                success: true,
                message: "Cập nhật địa chỉ thành công",
                data: updateAddress
            });
    } catch (error) {
        // Nếu lỗi do người dùng truyền sai ID hoặc không có quyền (ném ra từ Service)
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 *  Xóa địa chỉ 
 */
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.userId;
        const addressId = req.params.id;

        await addressService.deleteAddress(userId, addressId);

        res.status(200).json({
            success: true,
            message: "Xóa địa chỉ thành công"
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress
};