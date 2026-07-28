"use client";

import { useState } from "react";
import { Mail, Send, ArrowLeft, LockKeyhole, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) return setError("Email is required"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email address"), false;
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send reset link");
      toast.success("Password reset link sent to your email!");
      setEmailSent(true);
    } catch (err) {
      toast.error(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title={<>Forgot your <span style={{ color: "#FF7A2B" }}>password?</span></>}
      subtitle="Happens to everyone. We'll send you a reset link — no drama."
    >
      <div className="mb-8 flex flex-col items-start">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <LockKeyhole size={22} />
        </div>
        <h1
          className="text-3xl font-extrabold fc-text tracking-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          {emailSent ? "Check your inbox" : "Reset password"}
        </h1>
        <p className="text-sm fc-text-tertiary">
          {emailSent
            ? "We've sent instructions to reset your password."
            : "Enter the email tied to your account."}
        </p>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="forgot-password-form">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 fc-text-muted" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                data-testid="forgot-email-input"
                className={`fc-input w-full h-11 pl-10 pr-3 rounded-xl text-sm ${
                  error ? "border-red-400" : ""
                }`}
              />
            </div>
            {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="forgot-submit-btn"
            className="fc-btn-accent w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send reset link
              </>
            )}
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold fc-text-tertiary hover:fc-accent transition-colors"
          >
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </form>
      ) : (
        <div className="space-y-5">
          <div
            className="rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "var(--accent-soft)",
              border: "1px solid var(--accent-ring)",
            }}
          >
            <Mail className="w-5 h-5 shrink-0 mt-0.5 fc-accent" />
            <div>
              <p className="text-sm font-semibold fc-text">Link sent to</p>
              <p className="text-sm fc-accent font-bold mt-0.5">{email}</p>
              <p className="text-[12px] fc-text-tertiary mt-2 leading-relaxed">
                Didn't arrive within a few minutes? Check spam or{" "}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="fc-accent font-semibold hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold fc-text-tertiary hover:fc-accent transition-colors"
          >
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
