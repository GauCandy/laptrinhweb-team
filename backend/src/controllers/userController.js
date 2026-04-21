const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {

        // Hứng params từ URL (VD: /api/users?search=abc&role=CUSTOMER)
        const { search, role } = req.query;

        // Truyền xuống service
        const users = await userService.getAllUsers(search, role);

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID của user bị đổi quyền từ URL
        const { role } = req.body; // Lấy Role mới từ Body (JSON)

        if (!role) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp role mới" });
        }

        const updatedUser = await userService.updateUserRole(id, role);
        
            res.status(200).json({
                success: true,
                message: "Cập nhật thành công",
                data: updatedUser
            });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- MỞ/KHÓA TÀI KHOẢN ----
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; // Client cần gửi lên { "isActive": false } hoặc true

        // Kiểm tra xem client cosguiwr isActive lên không (phải dùng !== undefined vì false là falsy value)
        if (isActive === undefined) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp trạng thái isActive (true/false)" });
        }

        const updatedUser = await userService.toggleUserStatus(id, isActive);

        res.status(200).json({
            success: true,
            message: isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
            data: updatedUser
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    toggleUserStatus
}

