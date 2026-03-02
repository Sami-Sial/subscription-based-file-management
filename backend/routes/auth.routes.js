// routes/auth.routes.js
import express from "express";
const router = express.Router();

import * as authController from "../controllers/auth.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

import {
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../zod-validations/auth.validations.js";

import { validateBody } from "../middlewares/validate.middleware.js";

// ─── SIGNUP ───────────────────────────────
router.post("/register", validateBody(signupSchema), authController.signup);

// ─── VERIFY OTP ───────────────────────────
router.post(
  "/verify-otp",
  validateBody(verifyOtpSchema),
  authController.verifyOtp
);

// ─── RESEND OTP ───────────────────────────
router.post(
  "/resend-otp",
  validateBody(resendOtpSchema),
  authController.resendOtp
);

// ─── LOGIN ────────────────────────────────
router.post("/login", validateBody(loginSchema), authController.login);

// ─── FORGOT PASSWORD ──────────────────────
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// ─── RESET PASSWORD ───────────────────────
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// ─── CHANGE PASSWORD ──────────────────────
router.put(
  "/change-password",
  isLoggedIn,
  validateBody(changePasswordSchema),
  authController.changePassword
);

// ─── GET LOGGED-IN USER ───────────────────
router.get("/me", isLoggedIn, authController.getMe);

export default router;
