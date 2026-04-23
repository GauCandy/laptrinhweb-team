const express = require("express");
const router = express.Router();
const adminCartController = require("../controllers/adminCartController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

router.get(
  "/admin/dashboard",
  verifyToken,
  authorizeRole("ADMIN"),
  adminCartController.adminGetCartDashboard,
);

module.exports = router;
