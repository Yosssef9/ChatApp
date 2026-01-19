import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  refreshAccessToken,
} from "../controllers/authControllers.js";
import { validate } from "../middlewares/validate.js";
import rateLimiter from "../middlewares/rateLimiter.js";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  rateLimiter,

  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  validate, // ✅ runs before registerUser
  registerUser
);

// 📌 Login route
router.post(
  "/login",
  rateLimiter,

  [body("password").notEmpty().withMessage("Password is required")],
  validate,

  loginUser
);

router.get("/me", authMiddleware, getMe);
router.post("/logout", logoutUser);
router.get("/refreshAccessToken", refreshAccessToken);

export default router;
