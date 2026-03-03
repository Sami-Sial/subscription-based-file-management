"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
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

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully!");

      // Redirect to OTP verification
      router.push(`/otp-verify?email=${encodeURIComponent(data.data.email)}`);
    } catch (error) {
      console.error("Registration API Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-[400px] space-y-6">
            {/* Title Section */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-gray-900">
                Create your account
              </h1>
              <p className="text-gray-500 text-xs">
                Join thousands of users managing files securely.
              </p>
            </div>

            {/* Register Form Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="fullName"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full rounded-lg border ${
                        errors.fullName ? "border-red-400" : "border-gray-200"
                      } bg-white py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all outline-none`}
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full rounded-lg border ${
                        errors.email ? "border-red-400" : "border-gray-200"
                      } bg-white py-2 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all outline-none`}
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full rounded-lg border ${
                        errors.password ? "border-red-400" : "border-gray-200"
                      } bg-white py-2 pl-8 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all outline-none`}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
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

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label
                    className="text-xs font-semibold text-gray-700"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                      <LockKeyhole className="w-4 h-4" />
                    </div>
                    <input
                      className={`block w-full rounded-lg border ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-gray-200"
                      } bg-white py-2 pl-8 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all outline-none`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
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

                {/* Terms Checkbox */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-start gap-2">
                    <input
                      className={`mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 transition-colors cursor-pointer ${
                        errors.agreeToTerms ? "border-red-400" : ""
                      }`}
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <label
                      className="text-xs font-medium text-gray-600 cursor-pointer select-none"
                      htmlFor="agreeToTerms"
                    >
                      I agree to the{" "}
                      <a
                        className="text-indigo-600 hover:underline font-semibold"
                        href="#"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        className="text-indigo-600 hover:underline font-semibold"
                        href="#"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Create Account Button */}
                <button
                  className="group relative flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 active:scale-[0.98] disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1.5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Link */}
            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <a
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
                href="/login"
              >
                Sign in
              </a>
            </p>
          </div>
        </main>

        {/* Bottom Decoration */}
        <div className="h-[2px] bg-gradient-to-r from-indigo-100 via-indigo-600 to-indigo-100"></div>
      </div>
    </>
  );
}
