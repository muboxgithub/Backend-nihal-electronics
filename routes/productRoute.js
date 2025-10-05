const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const isAuth = require("../middlewares/authMiddleware");

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:product_id", getProductById);
router.post(
  "/",
  isAuth,
  [
    body("name")
      .isLength({ min: 1, max: 255 })
      .withMessage("Name is required and max 255 chars"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description max 1000 chars"),
    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be positive number"),
    body("original_price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Original price positive"),
    body("discount_percentage")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Discount 0-100%"),
    body("stock").isInt({ min: 0 }).withMessage("Stock non-negative integer"),
    body("category_id").optional().isUUID(4).withMessage("Invalid category ID"),
    body("brand")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Brand max 100 chars"),
    body("is_featured")
      .optional()
      .isBoolean()
      .withMessage("is_featured must be boolean"),
    body("badge_type")
      .optional()
      .isIn(["hot_deal", "best_seller", "new_arrival", "featured"])
      .withMessage("Invalid badge_type"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });
    }
    next();
  },
  createProduct
);

// PUT /api/products/:product_id (Update - validate param + optional body)
router.put(
  "/:product_id",
  isAuth,
  [
    param("product_id").isUUID(4).withMessage("Invalid product ID"),
    body("name")
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage("Name max 255 chars"),
    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description max 1000 chars"),
    body("price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Price positive"),
    body("original_price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Original price positive"),
    body("discount_percentage")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Discount 0-100%"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock non-negative"),
    body("category_id").optional().isUUID(4).withMessage("Invalid category ID"),
    body("brand")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Brand max 100 chars"),
    body("is_featured")
      .optional()
      .isBoolean()
      .withMessage("is_featured boolean"),
    body("badge_type")
      .optional()
      .isIn(["hot_deal", "best_seller", "new_arrival", "featured"])
      .withMessage("Invalid badge_type"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });
    }
    next();
  },
  updateProduct
);
router.delete("/:product_id", isAuth, deleteProduct);

module.exports = router;
