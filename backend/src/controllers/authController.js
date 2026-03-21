const authService = require('../services/authService');

// Hàm điểu khiển luồng đăng ký
const register = async (req, res) => {
    try {
        // Rút trích dữ liệu khách gửi lên từ body
        const { email, password, fullName } = req.body;

        // Validate cơ bản: Bắt buộc phải có email và pass
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp đầy đủ Email và Mật khẩu!"
            });
        }

       // nên dùng thêm thư viện như Joi hoặc Zod để check xem email
       //  có đúng định dạng @gmail.com không, pass có đủ 8 ký tự không.
       //  (Tạm thời bỏ qua để làm luồng chính trước).

       // Gọi service ra làm việc nặng (Vào DB check trùng, băm pass, lưu user)
       const newUser = await authService.registerUser(email, password, fullName);

       // Báo tin vui về cho khách hàng 
       return res.status(201).json({
        success: true,
        message: "Đăng ký tài khoản thành công!",
        data: newUser
       });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Lỗi hệ thống đăng ký!"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập Email và Mật khẩu!"
            });
        }

        // Gọi công nhân Service ra check pass và cấp thẻ
        const result = await authService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: result.user,
            accessToken: result.token //Trả về cái thẻ từ cho khách
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

// Hàm này chỉ làm nhiệm vụ đẩy khách sang Google
const googleLogin = (req, res) => {
  const url = authService.getGoogleAuthUrl();
  res.redirect(url); // Redirect là lệnh ép trình duyệt chuyển hướng
};

const googleCallback = async (req, res) => {
    try {
        const {code} = req.query; // Google sẽ gắn mã code lên thanh URL

        if (!code) {
            return res.status(400).json({ success: false, message: "Google không trả về mã xác nhận!" });
        }

        // Đưa mã cho công nhân sử lý
        const result = authService.loginWithGoogle(code);

        // Thành công! Tạm thời trả về JSON để xem kết quả.
    // Thực tế sau này, chỗ này ta sẽ dùng res.redirect để đẩy khách về trang chủ giao diện.
    return res.status(200).json({
        success: true,
        message: "Đăng nhập Google thành công rực rỡ!",
        data: result.user,
        accessToken: result.token
    });

    } catch (error) {
        console.error("Lỗi Google Auth:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng nhập Google!" });
    }
}

module.exports = {
    register,
    login,
    googleCallback,
    googleLogin
};