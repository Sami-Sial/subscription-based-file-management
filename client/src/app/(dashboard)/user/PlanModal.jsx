"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, X, Check, Star, Zap } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function PlanModal({
  isOpen,
  onClose,
  currentSubscription,
  onSubscriptionUpdate,
}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectLoading, setSelectLoading] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(null);

  useEffect(() => {
    if (isOpen) fetchSubscriptions();
  }, [isOpen]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/user/all-subscriptions`
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch subscriptions");
      setSubscriptions(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleFreePlan = async (subscription) => {
    setSelectLoading(subscription.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/user/subscribe-free`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ subscriptionId: subscription.id }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to subscribe");
      toast.success(`${subscription.name} plan activated!`);
      onSubscriptionUpdate(data.data);
    } catch (err) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setSelectLoading(null);
    }
  };

  const handlePaidPlan = async (subscription) => {
    setStripeLoading(subscription.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/stripe/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ subscriptionId: subscription.id }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to initiate payment");

      window.location.href = data.data.url;
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast.error(err.message || "Failed to process payment");
    } finally {
      setStripeLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #5048e5, #7c3aed);
            border-radius: 10px;
            border: 2px solid #f8fafc;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #4338ca, #6d28d9);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #5048e5 #f8fafc;
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/90 hover:bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-all cursor-pointer shadow-sm"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="overflow-y-auto custom-scrollbar flex-1">
            <div className="py-2 text-center sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Choose Your Perfect Plan
              </motion.h2>
            </div>

            <div className="px-8 py-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-4"
                  >
                    <Loader2 className="w-10 h-10 text-blue-600" />
                  </motion.div>
                  <p className="text-gray-500 text-sm font-medium">
                    Loading subscription plans...
                  </p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                    <Star size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-semibold text-sm mb-1">
                    No Plans Available
                  </p>
                  <p className="text-gray-500 text-xs">
                    Subscription plans will appear here once available
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-wrap justify-center gap-6">
                  {subscriptions.map((sub, index) => {
                    const isCurrent =
                      currentSubscription?.subscriptionId === sub.id ||
                      currentSubscription?.subscription?.id === sub.id;

                    const isPopular = sub.name?.toLowerCase() === "gold";

                    const allowedTypes = Array.isArray(sub.allowedTypes)
                      ? sub.allowedTypes
                      : [];

                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={`group relative flex flex-col rounded-xl transition-all w-[280px] flex-shrink-0 ${
                          isPopular
                            ? "bg-gradient-to-br from-blue-500 to-violet-600 p-[2px] shadow-xl shadow-blue-500/25 scale-[1.02]"
                            : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                        }`}
                      >
                        <div
                          className={`flex flex-col h-full rounded-xl ${
                            isPopular ? "bg-white" : ""
                          } p-5`}
                        >
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex gap-2">
                            {isPopular && (
                              <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                <Star size={8} fill="currentColor" />
                                Most Popular
                              </div>
                            )}
                            {isCurrent && (
                              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                <Check size={8} strokeWidth={3} />
                                Current
                              </div>
                            )}
                          </div>

                          <div className="mb-4 pt-1 text-center">
                            <h3
                              className={`text-lg font-bold mb-3 ${
                                isPopular
                                  ? "bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
                                  : "text-gray-900"
                              }`}
                            >
                              {sub.name || "Plan"}
                            </h3>

                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900">
                                  ${(Number(sub.priceMonthly) || 0).toFixed(2)}
                                </span>
                                <span className="text-gray-500 text-xs font-medium">
                                  /mo
                                </span>
                              </div>
                              {Number(sub.priceMonthly) > 0 && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                  Billed monthly
                                </p>
                              )}
                            </div>
                          </div>

                          <div
                            className={`h-[1px] mb-4 ${
                              isPopular
                                ? "bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20"
                                : "bg-gray-200"
                            }`}
                          />

                          <div className="flex-1 space-y-3 mb-6 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Max Folders</span>
                              <span className="font-bold text-gray-900 text-sm">
                                {sub.maxFolders ?? "Unlimited"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                Nesting Level
                              </span>
                              <span className="font-bold text-gray-900 text-sm">
                                {sub.maxNesting ?? 0}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-gray-600 block">
                                File Types
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {allowedTypes.length > 0 ? (
                                  allowedTypes.map((type) => (
                                    <span
                                      key={type}
                                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
                                        isPopular
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : "bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      {type}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400 text-[10px]">
                                    None specified
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                Max File Size
                              </span>
                              <span className="font-bold text-gray-900 text-sm">
                                {sub.maxFileSizeMB ?? "?"} MB
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Total Files</span>
                              <span className="font-bold text-gray-900 text-sm">
                                {(
                                  Number(sub.totalFileLimit) || 0
                                ).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Per Folder</span>
                              <span className="font-bold text-gray-900 text-sm">
                                {sub.filesPerFolder ?? "Unlimited"}
                              </span>
                            </div>
                          </div>

                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs bg-gray-100 text-gray-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                              <Check size={14} strokeWidth={3} />
                              Current Plan
                            </button>
                          ) : Number(sub.priceMonthly) === 0 ? (
                            <button
                              onClick={() => handleFreePlan(sub)}
                              disabled={selectLoading === sub.id}
                              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isPopular
                                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-md shadow-blue-500/25"
                                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {selectLoading === sub.id ? (
                                <>
                                  <Loader2
                                    className="w-3.5 h-3.5 animate-spin"
                                    strokeWidth={3}
                                  />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap size={14} strokeWidth={2.5} />
                                  Get Started
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePaidPlan(sub)}
                              disabled={stripeLoading === sub.id}
                              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isPopular
                                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-md shadow-blue-500/25"
                                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {stripeLoading === sub.id ? (
                                <>
                                  <Loader2
                                    className="w-3.5 h-3.5 animate-spin"
                                    strokeWidth={3}
                                  />
                                  Redirecting...
                                </>
                              ) : (
                                <>
                                  <Zap size={14} strokeWidth={2.5} />
                                  Upgrade Now
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
