const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Chặn khách lại, yêu cầu xuất trình thẻ ở phần Header của Request
    const authHeader = req.headers.authorization;

    //Tiêu chuẩn quốc tế: Thẻ từ gửi lên phải có chữ "Bearer " đứng trước
    if (!authHeader || !authHeader.startsWith('bearer')) {
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

module.exports = {
    verifyToken
}