"use client";

import { useState } from "react";
import { Mail, Send, ArrowLeft, LockKeyhole } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validation
  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  // Handle form submission
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

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      toast.success("Password reset link sent to your email!");
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot Password API Error:", error);
      toast.error(
        error.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-[420px]">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-600 text-white">
                <LockKeyhole className="w-6 h-6" />
              </div>
            </div>

            {/* Card */}
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {!emailSent ? (
                <>
                  <div className="flex flex-col gap-1 mb-5">
                    <h1 className="text-xl leading-tight text-black/80 font-black mb-5">
                      Forgot password?
                    </h1>
                    <p className="text-gray-600 text-xs">
                      Enter the email associated with your account and we'll
                      send an email with instructions to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          className={`flex w-full rounded-lg border ${
                            error ? "border-red-400" : "border-gray-200"
                          } bg-white py-2 pl-8 pr-3 text-sm text-black focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all placeholder:text-black/50`}
                          placeholder="name@company.com"
                          type="email"
                          value={email}
                          onChange={handleChange}
                          disabled={loading}
                        />
                      </div>
                      {error && (
                        <p className="text-red-500 text-[10px] mt-0.5">
                          {error}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center rounded-lg h-10 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm disabled:bg-indigo-400 disabled:cursor-not-allowed cursor-pointer"
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
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1.5" />
                          <span>Send reset link</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <a
                        className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                        href="/login"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Back to login
                      </a>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className="text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-3">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Check your email
                    </h2>
                    <p className="text-gray-600 text-xs">
                      We've sent a password reset link to
                      <br />
                      <span className="font-semibold text-gray-900">
                        {email}
                      </span>
                    </p>
                    <p className="text-gray-500 text-[10px] pt-2">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        onClick={() => {
                          setEmailSent(false);
                          setEmail("");
                        }}
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                      >
                        try again
                      </button>
                    </p>
                    <div className="pt-4">
                      <a
                        className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                        href="/login"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Back to login
                      </a>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
