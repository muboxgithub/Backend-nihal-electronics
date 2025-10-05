const express = require("express");
const router = express.Router();

const { body, param, validationResult } = require("express-validator");
const isAuth = require("../middlewares/authMiddleware");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categorieController");

router.get("/", getAllCategories);
router.get("/:category_id", getCategoryById);
router.post(
  "/",
  isAuth,
  [
    body("name")
      .isLength({ min: 1, max: 255 })
      .withMessage("Name required, max 255 chars"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max 500 chars"),
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
  createCategory
);
router.put(
  "/:category_id",
  isAuth,
  [
    param("category_id").isUUID(4).withMessage("Invalid category ID"),
    body("name")
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage("Name max 255 chars"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max 500 chars"),
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
  updateCategory
);
router.delete("/:category_id", deleteCategory);

module.exports = router;
