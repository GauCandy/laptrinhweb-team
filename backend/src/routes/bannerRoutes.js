const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");
const { route } = require("./productRoute");

// Cho trang chủ khách hàng (không cần đăng nhập)
router.get("/", bannerController.getActive);

// Cho admin
router.get(
  "/admin",
  verifyToken,
  authorizeRole("ADMIN"),
  bannerController.getAdmin,
);
router.post(
  "/admin",
  verifyToken,
  authorizeRole("ADMIN"),
  upload.single("image"),
  bannerController.create,
);

router.put(
  "/admin/:id/status",
  verifyToken,
  authorizeRole("ADMIN"),
  bannerController.toggleStatus,
);
router.delete(
  "/admin/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  bannerController.remove,
);

module.exports = router;
