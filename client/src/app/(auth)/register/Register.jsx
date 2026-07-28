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
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

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
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2)
      newErrors.fullName = "Name must be at least 2 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      toast.success("Account created successfully!");
      router.push(`/otp-verify?email=${encodeURIComponent(data.data.email)}`);
    } catch (error) {
      console.error("Registration API Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title={<>Start with <span style={{ color: "#FF7A2B" }}>structure.</span></>}
      subtitle="Join teams who prefer their storage rules enforced — not suggested."
      footer={
        <p className="text-xs fc-text-tertiary">
          Already registered?{" "}
          <Link
            href="/login"
            className="fc-accent font-semibold hover:underline"
            data-testid="login-link"
          >
            Sign in instead
          </Link>
        </p>
      }
    >
      <div className="mb-7">
        <h1
          className="text-3xl font-extrabold fc-text tracking-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          Create your account
        </h1>
        <p className="text-sm fc-text-tertiary">
          Free tier available. Upgrade any time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
            Full name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="fullName"
              type="text"
              placeholder="Alex Doe"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              data-testid="register-name-input"
              className={`fc-input w-full h-11 pl-10 pr-3 rounded-xl text-sm ${
                errors.fullName ? "border-red-400" : ""
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              data-testid="register-email-input"
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
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              data-testid="register-password-input"
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

        {/* Confirm */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
            Confirm password
          </label>
          <div className="relative">
            <LockKeyhole className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              data-testid="register-confirm-password-input"
              className={`fc-input w-full h-11 pl-10 pr-11 rounded-xl text-sm ${
                errors.confirmPassword ? "border-red-400" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg fc-text-muted hover:fc-text-secondary"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500 font-medium">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms */}
        <label
          className="flex items-start gap-2.5 py-1 cursor-pointer select-none"
          data-testid="register-terms-checkbox"
        >
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-1 w-4 h-4 rounded"
            style={{ accentColor: "var(--accent)" }}
          />
          <span className="text-[12px] fc-text-tertiary leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="fc-accent font-semibold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="fc-accent font-semibold hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-[11px] text-red-500 font-medium -mt-2">{errors.agreeToTerms}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          data-testid="register-submit-btn"
          className="fc-btn-accent w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Create account
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
