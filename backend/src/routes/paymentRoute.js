const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentsController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

router.get(
  "/admin/pay",
  verifyToken,
  authorizeRole("ADMIN"),
  paymentController.adminGetAllPayments,
);

router.put(
  "/admin/:id/pay/status",
  verifyToken,
  authorizeRole("ADMIN"),
  paymentController.updatePaymentStatus,
);

router.post("/:id/pay", verifyToken, paymentController.processPayment);

module.exports = router;
