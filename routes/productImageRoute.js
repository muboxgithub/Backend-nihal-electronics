const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/multerMiddleware");

const {
  createProductImages,
  getProductImages,
  getProductImageById,
  updateProductImage,
  deleteProductImage,
} = require("../controllers/productImageController");

// POST create multiple images (multipart/form-data)
router.post(
  "/:product_id/images",
  isAuth,
  upload.array("images", 10), // Multiple files, max 10
  createProductImages
); // Max 10 images

// GET all images for product
router.get('/:product_id/images', isAuth, getProductImages);

// GET single image
router.get('/:product_id/images/:image_id', isAuth, getProductImageById);

// PUT update image (for non-file updates; for file replace, use separate endpoint)
router.put('/:product_id/images/:image_id', isAuth, upload.single('images'), updateProductImage);

// DELETE image
router.delete('/:product_id/images/:image_id', isAuth, deleteProductImage);

module.exports = router;
