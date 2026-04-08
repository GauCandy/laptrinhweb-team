const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/authRoute');
const addressRoute = require('./routes/addressRoute');
const adminRoute = require('./routes/adminRoute');



app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hệ thống Backend E-commerce đang hoạt động hoàn hảo!",
  });
});

app.use('/api/auth', authRoute);
app.use('/api/addresses', addressRoute);
app.use('/api/admin', adminRoute);


module.exports = app;