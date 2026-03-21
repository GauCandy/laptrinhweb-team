// Nạp các biến môi trường từ file .env vào process.env
require('dotenv').config();

// Import cấu hình ứng dụng từ app.js
const app = require('./app');

// Lấy Port từ .env, nếu không có thì dùng mặc định là 3000
const PORT = process.env.PORT || 6060;

// Khởi động server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});