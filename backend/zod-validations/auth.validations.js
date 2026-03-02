import { z } from "zod";

/* ========================= COMMON ========================= */

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Password validation (strong password)
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100);

/* ========================= SIGNUP ========================= */
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: emailSchema,

  password: passwordSchema,
});

/* ========================= LOGIN ========================= */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/* ========================= VERIFY OTP ========================= */
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{4,6}$/, "OTP must be 4-6 digits"),
});

/* ========================= RESEND OTP ========================= */
export const resendOtpSchema = z.object({
  email: emailSchema,
});

/* ========================= FORGOT PASSWORD ========================= */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/* ========================= RESET PASSWORD ========================= */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset token"),
  newPassword: passwordSchema,
});

/* ========================= CHANGE PASSWORD ========================= */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password required"),

  new_password: passwordSchema,
});

/* ========================= ID PARAM (if needed) ========================= */
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid ID"),
});
