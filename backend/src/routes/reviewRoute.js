const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");
const adminReviewController = require("../controllers/reviewController");

router.get(
  "/admin/dashboard",
  verifyToken,
  authorizeRole("ADMIN"),
  adminReviewController.adminGetDashboard,
);
router.put(
  "/admin/:id/status",
  verifyToken,
  authorizeRole("ADMIN"),
  adminReviewController.adminUpdateStatus,
);
// Công khai ai cũng xem được đánh giá
router.get("/:id/reviews", adminReviewController.getReviews);
// Khách viết đánh giá cần ( verifyToken)
router.post("/:id", verifyToken, adminReviewController.addReview);

module.exports = router;
