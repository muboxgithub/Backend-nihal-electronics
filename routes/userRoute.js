const express = require("express");
const router = express.Router();
const { registerUser, signIn } = require("../controllers/userController");

const { body, validationResult } = require("express-validator");

// POST /api/users/register (Validate registration fields)
router.post(
  "/register",
  [
    body("name")
      .isLength({ min: 1, max: 255 })
      .withMessage("Name is required and max 255 chars"),
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
    body("role")
      .optional()
      .isIn(["customer", "admin", "delivery"])
      .withMessage("Invalid role"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Valid phone number required"),
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
  registerUser
);

// POST /api/users/signin (Validate signin fields)
router.post(
  "/signin",
  [
    body("email")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
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
  signIn
);

module.exports = router;
