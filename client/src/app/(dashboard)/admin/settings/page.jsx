"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Key,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const inputClass =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5";

export default function AdminSettings() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch account details
  const fetchAccountDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch account details");
      setAccountData(data.data || data);
    } catch (error) {
      toast.error(error.message || "Failed to load account details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate days since joined
  const daysSinceJoined = (dateString) => {
    if (!dateString) return 0;
    const joinDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    setPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)
    ) {
      errors.newPassword =
        "Password must include uppercase, lowercase, and number";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword =
        "New password must be different from current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            current_password: passwordForm.currentPassword,
            new_password: passwordForm.newPassword,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update password");

      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2)
      return {
        strength,
        label: "Weak",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    if (strength <= 4)
      return {
        strength,
        label: "Medium",
        color: "text-amber-600 bg-amber-50 border-amber-200",
      };
    return {
      strength,
      label: "Strong",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <>
      <div className="min-h-screen max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Manage your account details and security settings
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Shield size={16} className="text-blue-600" />
            <span className="text-xs font-medium text-gray-600">
              Admin Account
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-400 font-medium">
              Loading account details...
            </p>
          </div>
        ) : (
          <>
            {/* Account Information */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-xl shadow-sm">
                  <User size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Account Information
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your personal details and account status
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-violet-50 rounded-lg">
                        <Mail size={16} className="text-violet-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Email Address
                      </p>
                    </div>
                    <div className="pl-10">
                      <p className="text-base font-semibold text-gray-900">
                        {accountData?.email || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-700">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Created */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Member Since
                      </p>
                    </div>
                    <div className="pl-10">
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(
                          accountData?.createdAt || accountData?.joinedAt
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {daysSinceJoined(
                          accountData?.createdAt || accountData?.joinedAt
                        )}{" "}
                        days ago
                      </p>
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Key size={16} className="text-amber-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        User ID
                      </p>
                    </div>
                    <div className="pl-10">
                      <p className="text-sm font-mono font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-200">
                        {accountData?.id || accountData?.userId || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Update Form */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 rounded-xl shadow-sm">
                  <Lock size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Change Password
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
                {/* Current Password */}
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      className={`${inputClass} pr-12 ${
                        passwordErrors.currentPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle size={12} className="text-red-500" />
                      <p className="text-xs text-red-500 font-medium">
                        {passwordErrors.currentPassword}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-5" />

                {/* New Password */}
                <div>
                  <label className={labelClass}>New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      className={`${inputClass} pr-12 ${
                        passwordErrors.newPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          Password Strength
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${passwordStrength.color}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              level <= passwordStrength.strength
                                ? passwordStrength.strength <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.strength <= 4
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {passwordErrors.newPassword && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle size={12} className="text-red-500" />
                      <p className="text-xs text-red-500 font-medium">
                        {passwordErrors.newPassword}
                      </p>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500">
                      Password must contain:
                    </p>
                    {[
                      {
                        test: passwordForm.newPassword.length >= 8,
                        label: "At least 8 characters",
                      },
                      {
                        test: /[A-Z]/.test(passwordForm.newPassword),
                        label: "One uppercase letter",
                      },
                      {
                        test: /[a-z]/.test(passwordForm.newPassword),
                        label: "One lowercase letter",
                      },
                      {
                        test: /\d/.test(passwordForm.newPassword),
                        label: "One number",
                      },
                    ].map(({ test, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            test
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {test ? (
                            <CheckCircle size={10} strokeWidth={3} />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <span
                          className={test ? "text-gray-700" : "text-gray-400"}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter your new password"
                      className={`${inputClass} pr-12 ${
                        passwordErrors.confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle size={12} className="text-red-500" />
                      <p className="text-xs text-red-500 font-medium">
                        {passwordErrors.confirmPassword}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordErrors({});
                    }}
                    className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-amber-600/25 cursor-pointer"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500 rounded-xl shadow-sm shrink-0">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    Security Best Practices
                  </h3>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>
                      • Use a unique password that you don't use elsewhere
                    </li>
                    <li>• Change your password regularly (every 3-6 months)</li>
                    <li>• Never share your password with anyone</li>
                    <li>• Enable two-factor authentication if available</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
