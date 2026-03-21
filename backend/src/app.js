const express = require('express');
const cors = require('cors'); // Nhớ chạy lệnh: npm install cors
const authRoutes = require('./routes/auth.route');

const app = express();

// --- 1. GLOBAL MIDDLEWARES ---
// Cho phép các domain khác (như frontend) gọi được API mà không bị chặn lỗi CORS
app.use(cors()); 

// Giúp Express đọc được dữ liệu định dạng JSON từ request body (rất quan trọng khi dùng Postman)
app.use(express.json()); 

// Giúp Express đọc được dữ liệu từ x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));



app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hệ thống Backend E-commerce đang hoạt động hoàn hảo! 🚀",
  });
});

app.use('/api/auth', authRoutes);


// Xuất app ra để server.js sử dụng
module.exports = app;