const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

router.get(
  "/admin/pay",
  verifyToken,
  authorizeRole("ADMIN"),
  orderController.adminGetAllPayments,
);

router.post("/:id/pay", verifyToken, orderController.processPayment);

module.exports = router;
