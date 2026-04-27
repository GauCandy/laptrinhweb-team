const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");

// Hai trạm kiểm soát
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRole("ADMIN"),
  dashboardController.getAdminDashboard,
);
router.get(
  "/users",
  verifyToken,
  authorizeRole("ADMIN"),
  userController.getAllUsers,
);
router.put("/users/:id/role", userController.updateUserRole);
router.put("/users/:id/status", userController.toggleUserStatus);

module.exports = router;
