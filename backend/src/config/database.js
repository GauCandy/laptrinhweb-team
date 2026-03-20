const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool (Hồ chứa kết nối)
// Thay vì mỗi lần truy vấn tạo 1 kết nối mới rồi đóng lại,
// Pool sẽ tạo ra sẵn một nhóm kết nối và luân chuyển dùng chung, giúp server chạy nhanh.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Tối đa 10 kết nối cùng lúc
    queueLimit:0
});

// pool.getConnection()
//     .then(connection => {
//         console.log('✅ Kết nối Database MySQL (pms_v2) thành công!');
//         connection.release(); // Trả kết nối lại cho Pool
//     })
//     .catch(err => {
//         console.error('❌ Lỗi kết nối Database:', err.message);
//     });

    module.exports = pool;