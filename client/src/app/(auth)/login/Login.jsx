"use client";

import { useState } from "react";
import { FolderOpen, Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const { email, password } = formData;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Special handling for unverified accounts
        if (response.status === 403) {
          toast.error(`Account not verified. OTP sent to ${email}`);
          // Redirect to OTP verification page
          router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
          return;
        }

        throw new Error(data.message || "Login failed");
      }

      toast.success(data.message || "Login successful!");

      // Store user data
      localStorage.setItem("token", data.data.token);

      // Redirect to dashboard or home
      router.push(`${data.data.user.role}/dashboard`);
    } catch (error) {
      console.error("Login API Error:", error);
      toast.error(error.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
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
                Welcome back
              </h1>
              <p className="text-gray-500 text-xs">
                Access your files from anywhere in the world.
              </p>
            </div>

            {/* Login Form Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleLogin} className="space-y-4">
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
                      disabled={loading}
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
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold text-gray-700"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      href="/forgot-password"
                    >
                      Forgot Password?
                    </a>
                  </div>
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
                      disabled={loading}
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
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

                {/* Sign In Button */}
                <button
                  className="group relative flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-1 active:scale-[0.98] disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
                  type="submit"
                  disabled={loading}
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
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-1.5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Link */}
            <p className="text-center text-xs text-gray-500">
              Don't have an account?{" "}
              <a
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
                href="/register"
              >
                Create an account
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
