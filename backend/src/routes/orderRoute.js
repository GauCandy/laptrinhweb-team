const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

// Chỉ cần đăng nhập là đặt được hàng
router.post("/", verifyToken, orderController.createOrder);
router.get("/", verifyToken, orderController.getMyOrders);
router.get(
  "/admin/orders",
  verifyToken,
  authorizeRole("ADMIN"),
  orderController.adminGetAllOrders,
);

router.get("/:id", verifyToken, orderController.getOrderById);

router.put(
  "/admin/orders/:id/status",
  verifyToken,
  authorizeRole("ADMIN"),
  orderController.adminUpdateStatus,
);
router.post(
  "/admin/orders/:id/shipment",
  verifyToken,
  authorizeRole("ADMIN"),
  orderController.adminCreateShipment,
);

module.exports = router;
