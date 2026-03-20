const express = require('express')
const cors = require('cors');
require('dotenv').config();

// Gọi file kết nối database
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 6060;

// Các middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bên trong app.js
const routes = require('./routes/index'); // Gọi file tổng đài

// Tất cả API của hệ thống sẽ bắt đầu bằng /api
app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Hệ thống quản lý điểm đã sẵn sàng! ');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`)
})
