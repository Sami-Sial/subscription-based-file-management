"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, XCircle } from "lucide-react";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(7);
  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    const activatePlan = async () => {
      if (!sessionId) {
        // No session ID — webhook may have already handled it, just show success
        setVerifying(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/stripe/verify-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Session verification failed:", data.message);
          // Don't show an error to the user if it's a duplicate (already processed by webhook)
          if (res.status !== 409) {
            setVerifyError(data.message || "Could not verify payment.");
          }
        } else {
          console.log("Plan activated:", data.message);
        }
      } catch (err) {
        console.error("Network error during verification:", err);
        // Don't block user on network errors - payment was already taken by Stripe
      } finally {
        setVerifying(false);
      }
    };

    activatePlan();
  }, [sessionId]);

  useEffect(() => {
    if (verifying) return; // Don't start countdown until verification is done

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/user/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, verifying]);

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center bg-white rounded-2xl p-12 shadow-2xl max-w-md w-full"
      >
        {verifying ? (
          /* Verifying State */
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
            <h1 className="text-2xl font-black text-gray-900">Activating Your Plan...</h1>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment.</p>
          </div>
        ) : verifyError ? (
          /* Error State (rare) */
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-400" />
            <h1 className="text-2xl font-black text-gray-900">Verification Issue</h1>
            <p className="text-gray-600 text-sm mb-2">{verifyError}</p>
            <p className="text-gray-400 text-xs">
              Your payment was received. Your plan will be updated shortly. If the issue persists, contact support.
            </p>
            <button
              onClick={() => router.push("/user/dashboard")}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg h-12 font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Success State */
          <>
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.2,
              }}
            >
              <div className="mx-auto w-18 h-18 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-13 h-13 text-green-500" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-black text-gray-900 mb-3 mt-4">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-2 text-lg">
                Your subscription has been activated.
              </p>
            </motion.div>

            {/* Redirect Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  Redirecting to dashboard in{" "}
                  <span className="font-bold text-indigo-600">{countdown}</span>s
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/user/dashboard")}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg h-12 font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Go to Dashboard Now
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        className="fixed top-20 left-20 w-32 h-32 bg-green-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-20 right-20 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

