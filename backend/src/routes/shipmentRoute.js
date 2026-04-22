const express = require("express");
const router = express.Router();
const orderController = require("../controllers/shipmentController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

// shipment
router.put(
  "/admin/orders/:id/shipment",
  verifyToken,
  authorizeRole("ADMIN"),
  orderController.adminCreateShipment,
);

module.exports = router;
