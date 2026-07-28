"use client";

import { useState, useRef } from "react";
import { Mail, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";

export default function OTPVerification() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    pastedData.split("").forEach((d, i) => {
      if (i < OTP_LENGTH) newOtp[i] = d;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }
    setLoadingVerify(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpCode }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verification failed");
      toast.success("Email verified successfully!");
      localStorage.setItem("token", data.data.token);
      router.push("/user/dashboard");
    } catch (err) {
      toast.error(err.message || "Verification failed. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    if (loadingResend) return;
    setLoadingResend(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend code");
      toast.success("Verification code sent successfully!");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (err) {
      toast.error(err.message || "Failed to resend code. Please try again.");
    } finally {
      setLoadingResend(false);
    }
  };

  const activeIndex = otp.findIndex((digit) => digit === "");
  const otpComplete = otp.join("").length === OTP_LENGTH;

  return (
    <AuthShell
      eyebrow="Verify email"
      title={<>Check your <span style={{ color: "#FF7A2B" }}>inbox.</span></>}
      subtitle="We've sent a 6-digit code to confirm it's really you."
    >
      <div className="mb-8 flex flex-col items-start">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Mail size={22} />
        </div>
        <h1
          className="text-3xl font-extrabold fc-text tracking-tight mb-2"
          style={{ letterSpacing: "-0.02em" }}
        >
          Verify your email
        </h1>
        <p className="text-sm fc-text-tertiary">
          Sent to <span className="font-semibold fc-text">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={loadingVerify}
              autoFocus={index === 0}
              data-testid={`otp-input-${index}`}
              className={`flex-1 h-14 rounded-xl text-center text-xl font-extrabold outline-none transition-all fc-text ${
                digit || index === activeIndex ? "" : ""
              }`}
              style={{
                background: "var(--bg-surface)",
                border: `2px solid ${
                  digit || index === activeIndex
                    ? "var(--accent)"
                    : "var(--border-default)"
                }`,
                color: digit ? "var(--accent)" : "var(--text-primary)",
                boxShadow:
                  digit || index === activeIndex ? "0 0 0 3px var(--accent-ring)" : "none",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loadingVerify || !otpComplete}
          data-testid="otp-verify-btn"
          className="fc-btn-accent w-full h-12 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loadingVerify ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </>
          ) : (
            <>
              Verify account <ArrowRight size={14} />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs fc-text-tertiary mb-1.5">Didn't get the code?</p>
          <button
            onClick={handleResend}
            disabled={loadingResend}
            data-testid="otp-resend-btn"
            className="text-xs font-bold fc-accent hover:underline inline-flex items-center gap-1 group disabled:opacity-60"
          >
            {loadingResend ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                Resend code
              </>
            )}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}
