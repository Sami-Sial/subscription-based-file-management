"use client";

import { useState, useRef } from "react";
import { Mail, ArrowRight, RefreshCw, Shield, HelpCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function OTPVerification() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  const inputRefs = useRef([]);

  // Handle OTP input change
  const handleOtpChange = (value, index) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, OTP_LENGTH);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((digit, index) => {
      if (index < OTP_LENGTH) newOtp[index] = digit;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  // Verify OTP
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

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      toast.success("Email verified successfully!");
      localStorage.setItem("token", data.data.token);
      router.push("/user/dashboard");
    } catch (error) {
      toast.error(error.message || "Verification failed. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoadingVerify(false);
    }
  };

  // Resend OTP
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

      if (!response.ok)
        throw new Error(data.message || "Failed to resend code");

      toast.success("Verification code sent successfully!");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } catch (error) {
      toast.error(error.message || "Failed to resend code. Please try again.");
    } finally {
      setLoadingResend(false);
    }
  };

  const activeIndex = otp.findIndex((digit) => digit === "");

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-[420px] space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Verify your email
              </h1>
              <p className="text-gray-500 text-xs leading-relaxed">
                We've sent a 6-digit verification code to
                <br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="flex gap-2">
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
                      className={`h-11 w-9 sm:h-12 sm:w-10 rounded-lg border-2 ${
                        digit || index === activeIndex
                          ? "border-indigo-600"
                          : "border-gray-200"
                      } bg-white text-center text-lg font-bold text-indigo-600 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerify}
                  disabled={loadingVerify || otp.join("").length !== OTP_LENGTH}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loadingVerify ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-xs text-gray-500">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={loadingResend}
                    className="text-indigo-600 font-semibold hover:text-indigo-700 text-xs flex items-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingResend ? (
                      <>
                        <svg
                          className="animate-spin h-3.5 w-3.5"
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
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                        <span>Resend code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
