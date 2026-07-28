"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        if (response.status === 403) {
          toast.error(`Account not verified. OTP sent to ${email}`);
          router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
          return;
        }
        throw new Error(data.message || "Login failed");
      }
      toast.success(data.message || "Login successful!");
      localStorage.setItem("token", data.data.token);
      router.push(`${data.data.user.role}/dashboard`);
    } catch (error) {
      console.error("Login API Error:", error);
      toast.error(error.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title={<>Welcome <span style={{ color: "#FF7A2B" }}>back.</span></>}
      subtitle="Pick up right where you left off. Your files are waiting."
      footer={
        <p className="text-xs fc-text-tertiary">
          New to FileCloud?{" "}
          <Link
            href="/register"
            className="fc-accent font-semibold hover:underline"
            data-testid="signup-link"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold fc-text tracking-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          Sign in
        </h1>
        <p className="text-sm fc-text-tertiary">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5" data-testid="login-form">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              data-testid="login-email-input"
              className={`fc-input w-full h-11 pl-10 pr-3 rounded-xl text-sm ${
                errors.email ? "border-red-400" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold fc-accent hover:underline"
              data-testid="forgot-password-link"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              data-testid="login-password-input"
              className={`fc-input w-full h-11 pl-10 pr-11 rounded-xl text-sm ${
                errors.password ? "border-red-400" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg fc-text-muted hover:fc-text-secondary"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 font-medium">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit-btn"
          className="fc-btn-accent w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign in
            </>
          )}
        </button>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px fc-border-subtle" style={{ background: "var(--border-default)" }} />
          <span className="text-[10px] font-black uppercase tracking-widest fc-text-muted">
            Secured by FileCloud
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
        </div>
      </form>
    </AuthShell>
  );
}
