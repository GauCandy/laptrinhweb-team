const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`[Đang gọi tới Server]: ${req.method} ${req.url}`);
  next();
});

const authRoute = require("./routes/authRoute");
const addressRoute = require("./routes/addressRoute");
const adminRoute = require("./routes/adminRoute");
const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const paymentRoute = require("./routes/paymentRoute");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hệ thống Backend E-commerce đang hoạt động hoàn hảo!",
  });
});

app.use("/api/auth", authRoute);
app.use("/api/addresses", addressRoute);
app.use("/api/admin", adminRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
