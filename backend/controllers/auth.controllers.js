import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { addMinutes, generateOTP } from "../lib/otp.js";
import { success, error } from "../lib/response.js";
import { sendMail } from "../lib/mailer.js";
import { generateToken } from "../lib/jwt.js";

/* ========================= SIGNUP ========================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) return error(res, 409, "Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationOtp: otp,
        otpExpiresAt: addMinutes(10),
      },
    });
    console.log(createdUser);

    const mailSent = await sendMail({
      to: email,
      subject: "Verify Your Email",
      html: `<p>Hello ${name},</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>Expires in 10 minutes.</p>`,
    });

    if (!mailSent) return error(res, 500, "Failed to send verification email");

    return success(res, 200, "Signup successful. OTP sent.", {
      email: createdUser.email,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= VERIFY OTP ========================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationOtp: otp,
        otpExpiresAt: { gt: new Date() },
      },
    });

    if (!user) return error(res, 400, "Invalid or expired OTP");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOtp: null,
        otpExpiresAt: null,
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return success(res, 200, "Account verified successfully", {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= RESEND OTP ========================= */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return error(res, 400, "Email required");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return error(res, 404, "User not found");

    const otp = generateOTP();

    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        otpExpiresAt: addMinutes(10),
      },
    });

    await sendMail({
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP: <b>${otp}</b></p>`,
    });

    return success(res, 200, "OTP resent successfully");
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return error(res, 400, "Email and password required");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return error(res, 401, "Invalid credentials");

    if (!user.password) return error(res, 400, "Use Google login");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, 401, "Invalid credentials");

    if (!user.isVerified) {
      const otp = generateOTP();

      await prisma.user.update({
        where: { email },
        data: {
          verificationOtp: otp,
          otpExpiresAt: addMinutes(10),
        },
      });

      await sendMail({
        to: email,
        subject: "Verify your account",
        html: `Your OTP: ${otp}`,
      });

      return error(res, 403, "Account not verified. OTP sent.");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return success(res, 200, "Login successful", {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= GET LOGGED-IN USER ========================= */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    if (!user) return error(res, 404, "User not found");

    return success(res, 200, "User fetched successfully", user);
  } catch (err) {
    console.error("GetMe Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= GOOGLE LOGIN ========================= */
export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name } = req.body;

    if (!googleId || !email) return error(res, 400, "Invalid Google data");

    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
          isVerified: true,
        },
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return success(res, 200, "Google login successful", {
      token,
      user,
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= FORGOT PASSWORD ========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return error(res, 400, "Email required");

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Update user with reset token and expiry
    const user = await prisma.user
      .update({
        where: { email },
        data: {
          resetToken: token,
          resetTokenExpires: addMinutes(15), // 15 minutes expiry
        },
      })
      .catch(() => null);

    if (!user) return error(res, 404, "User not found");

    // Construct reset password link
    const resetLink = `${process.env.FRONTEND_URL}/forgot-password/reset?token=${token}&email=${email}`;

    // Send email with reset link
    const mailSent = await sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `
                <p>Hello ${user.name || "User"},</p>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
                <p>This link will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `,
    });

    if (!mailSent) return error(res, 500, "Failed to send reset email");

    return success(res, 200, "Password reset email sent successfully");
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= RESET PASSWORD ========================= */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) return error(res, 400, "Invalid request");

    // Find user by token only
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) return error(res, 400, "Invalid token");

    // Check expiry
    if (!user.resetTokenExpires || new Date() > user.resetTokenExpires)
      return error(res, 400, "Token has expired");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return success(res, 200, "Password updated successfully");
  } catch (err) {
    console.error("Reset Password Error:", err);
    return error(res, 500, "Internal server error");
  }
};

/* ========================= CHANGE PASSWORD ========================= */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password)
      return error(res, 400, "All fields required");

    if (current_password === new_password)
      return error(res, 400, "New password must differ");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return error(res, 404, "User not found");

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return error(res, 400, "Current password incorrect");

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return success(res, 200, "Password changed successfully");
  } catch (err) {
    console.error("Change Password Error:", err);
    return error(res, 500, "Internal server error");
  }
};
