"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password requirements state
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUppercase: false,
  });

  // Check password requirements
  useEffect(() => {
    const password = formData.password;
    setRequirements({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    });
  }, [formData.password]);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!Object.values(requirements).every(Boolean)) {
      newErrors.password = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Reset Password API Error:", error);
      toast.error(
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-[420px]">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-600 text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Card */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col gap-1 mb-5">
                <h2 className="text-xl font-bold leading-tight text-black/80 font-black">
                  Set new password
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className={`flex w-full rounded-lg border text-black/70 ${
                        errors.password ? "border-red-400" : "border-gray-200"
                      } bg-white py-2 pl-8 pr-9 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all`}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      className={`flex w-full rounded-lg text-black/70 border ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-gray-200"
                      } bg-white py-2 pl-8 pr-9 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all`}
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="py-2">
                  <p className="text-[10px] font-medium text-gray-500 mb-2">
                    Password must include:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`flex items-center gap-1.5 text-[10px] ${
                        requirements.minLength
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {requirements.minLength ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      8+ characters
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] ${
                        requirements.hasNumber
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {requirements.hasNumber ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      One number
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] ${
                        requirements.hasSpecialChar
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {requirements.hasSpecialChar ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      Special character
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[10px] ${
                        requirements.hasUppercase
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {requirements.hasUppercase ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      Uppercase letter
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    loading || !Object.values(requirements).every(Boolean)
                  }
                  className="w-full flex items-center justify-center rounded-lg h-10 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <span>Update password</span>
                  )}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
