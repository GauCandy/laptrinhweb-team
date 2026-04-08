const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Chặn khách lại, yêu cầu xuất trình thẻ ở phần Header của Request
    const authHeader = req.headers.authorization;

    //Tiêu chuẩn quốc tế: Thẻ từ gửi lên phải có chữ "Bearer " đứng trước
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({
            success: false,
            message: 'Truy cập bị từ chối! Bạn chưa cung cấp Token hợp lệ.'
        });
    }

    // Tách bỏ chữ "Bearer " để lấy đúng cái chuỗi mã vạch token
    const token = authHeader.split(' ')[1];
    try {
        //Bỏ vào máy soi: Dùng "Chữ ký bí mật" trong file .env để giải mã thẻ
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin khách (userId, role) từ trong thẻ ra, nhét vào req
    //để các bộ phận phía sau (Controller) biết ai đang gọi API
    req.user = decoded;

    // Thẻ chuẩn, cho phép đi tiếp vào Controller!
    next();
    }  catch (error) {
        // Nếu token bị sai chữ ký, hoặc đã quá hạn 7 ngày
        return res.status(403).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!"
        });
    }
};

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Chặn lỗi crash app kiểm tra xem req.user có tồn tại không đã
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Lỗi hệ thống: Không tìm thấy thông tin quyền hạn của người dùng!"
            });
        }

        // Lúc này, req.user đã được hàm verifyToken nhét vào rồi (chứa userId và role)
        // Ta chỉ cần lôi cái role ra để kiểm tra
        const userRole = req.user.role;

        // Nếu chức vụ của khách không nằm trong danh sách được phép -> Đuổi cổ
        if(!allowedRoles.includes(userRole)) {
            return res.status(403).json({ success: false, message: "Cảnh báo: Bạn không đủ quyền hạn (Role) để thực hiện hành động này!"});
        }

        // Nếu đúng chức vụ có thể đi tiếp đến controller
        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRole
}