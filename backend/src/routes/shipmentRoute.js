const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipmentController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

// shipment
router.put(
  "/admin/orders/:id/shipment",
  verifyToken,
  authorizeRole("ADMIN"),
  shipmentController.adminCreateShipment,
);

router.get(
  "/admin/shipments",
  verifyToken,
  authorizeRole("ADMIN"),
  shipmentController.adminGetAllShipments,
);

module.exports = router;
