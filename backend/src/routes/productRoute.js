const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const { upload } = require("../config/cloudinary");

// Public
router.get("/", productController.getProducts); // Lấy danh sách
router.get("/:id", productController.getProductDetails); // Lấy chi tiết
router.get("/featured", productController.getFeatured);

// ADMIN
router.post(
  "/",
  verifyToken,
  authorizeRole("ADMIN"),
  upload.single("image"),
  productController.createProduct,
);
router.put(
  "/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  upload.single("image"),
  productController.updateProduct,
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRole("ADMIN"),
  productController.deleteProduct,
);

router.put(
  "/admin/:id/featured",
  verifyToken,
  authorizeRole("ADMIN"),
  productController.toggleFeatured,
);

module.exports = router;
