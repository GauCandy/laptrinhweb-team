const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ sucsess: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server: " + error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID của user bị đổi quyền từ URL
        const { role } = req.body; // Lấy Role mới từ Body (JSON)

        if (!role) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp rolr mới" });
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

module.exports = {
    getAllUsers,
    updateUserRole
}

