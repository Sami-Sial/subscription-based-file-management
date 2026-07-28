"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUppercase: false,
  });

  useEffect(() => {
    const p = formData.password;
    setRequirements({
      minLength: p.length >= 8,
      hasNumber: /\d/.test(p),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(p),
      hasUppercase: /[A-Z]/.test(p),
    });
  }, [formData.password]);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (!Object.values(requirements).every(Boolean))
      newErrors.password = "Password does not meet all requirements";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
          body: JSON.stringify({ token, newPassword: formData.password }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reset password");
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (err) {
      toast.error(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <AuthShell
      eyebrow="Set new password"
      title={<>Almost <span style={{ color: "#FF7A2B" }}>done.</span></>}
      subtitle="Choose a strong password. You won't need to remember the old one."
    >
      <div className="mb-8 flex flex-col items-start">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <ShieldCheck size={22} />
        </div>
        <h1
          className="text-3xl font-extrabold fc-text tracking-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          New password
        </h1>
        <p className="text-sm fc-text-tertiary">
          Meet all requirements below to enable the submit button.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
            New password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Choose a strong password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
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
            Confirm new password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
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

        {/* Requirements */}
        <div
          className="rounded-xl p-4 grid grid-cols-2 gap-2.5"
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {[
            { key: "minLength", label: "8+ characters" },
            { key: "hasUppercase", label: "Uppercase letter" },
            { key: "hasNumber", label: "One number" },
            { key: "hasSpecialChar", label: "Special character" },
          ].map(({ key, label }) => {
            const met = requirements[key];
            return (
              <div
                key={key}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                  met ? "" : ""
                }`}
                style={{ color: met ? "#059669" : "var(--text-muted)" }}
              >
                {met ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                {label}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={loading || !Object.values(requirements).every(Boolean)}
          className="fc-btn-accent w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Updating...
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
