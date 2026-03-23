const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoute');

const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hệ thống Backend E-commerce đang hoạt động hoàn hảo! 🚀",
  });
});

app.use('/api/auth', authRoutes);


module.exports = app;