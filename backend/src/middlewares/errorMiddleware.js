// Bắt lỗi 404: Khi người dùng gõ sai URL 
const notFound = (req, res, next) => {
    const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
    res.status(404);
    next(error); // Chuyển lỗi này cho trạm bên dưới
}

// Trạm bắt lỗi tổng (Global Error Handler)
const errorHandler = (err, req, res, next) => {
    // Nếu status code vẫn là 200 mà lọt vào đây thì ép nó thành 500 Lỗi server
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Dấu vết lỗi (stack trace) chỉ hiện khi đa code (development), khi lên mạng thật thì giấu đi cho bảo mật
        stack: process.env.NODE_ENV === 'production' ? null :err.stack,
    });
};

module.exports = { notFound, errorHandler };