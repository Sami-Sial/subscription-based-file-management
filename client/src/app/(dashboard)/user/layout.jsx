"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Loader from "@/components/Loader";
import PlanModal from "./PlanModal";
import { toast } from "react-hot-toast";

export default function Page({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]); // full history array
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Derive the active subscription from the array
  const activeSubscription =
    subscriptions.find((s) => s.status === "active") || null;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Not authenticated");

        const data = await response.json();
        setUser(data.data);

        if (data.data.role === "admin") {
          window.location.href = "/admin/dashboard";
          return;
        }
      } catch (err) {
        console.log("Auth error:", err);
        setUser(null);
        toast.error(err.message || "Something went wrong");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Extracted subscription check function that can be called on-demand
  const checkSubscription = async (showModalOnNoSub = true) => {
    setSubscriptionLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/user/my-subscriptions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok || !data.data) {
        setSubscriptions([]);
        if (showModalOnNoSub) {
          setShowPlanModal(true);
        }
        return;
      }

      const allSubs = Array.isArray(data.data) ? data.data : [data.data];
      setSubscriptions(allSubs);

      const hasActive = allSubs.some((s) => s.status === "active");
      if (showModalOnNoSub) {
        setShowPlanModal(!hasActive);
      }
    } catch (err) {
      console.error("Subscription check error:", err);
      setSubscriptions([]);
      if (showModalOnNoSub) {
        setShowPlanModal(true);
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Check subscription after user is loaded
  useEffect(() => {
    if (!user) return;
    checkSubscription();
  }, [user]);

  // Handle modal close with refresh
  const handleModalClose = () => {
    setShowPlanModal(false);
    // Refetch subscription data to update banner
    checkSubscription(false); // false = don't auto-show modal again
  };

  if (loading || !user || subscriptionLoading) {
    return (
      <div className="flex bg-white items-center justify-center h-screen w-screen">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-[#f5f6fa] overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar
            onMenuToggle={() => setMobileOpen((prev) => !prev)}
            user={user}
          />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            {/* Warning Banner — has subscriptions but none active */}
            {subscriptions.length > 0 && !activeSubscription && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-800 mb-1">
                    Subscription Inactive
                  </h3>
                  <p className="text-sm text-red-700 mb-2">
                    Your subscription is currently inactive. Please renew or
                    select a new plan to continue using premium features.
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="text-sm font-semibold text-red-600 hover:text-red-800 underline cursor-pointer"
                  >
                    Select a Plan
                  </button>
                </div>
              </div>
            )}

            {/* Warning Banner — no subscriptions at all */}
            {subscriptions.length === 0 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-yellow-800 mb-1">
                    No Active Subscription
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    You don't have an active subscription. Please select a plan
                    to unlock all features.
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="text-sm font-semibold text-yellow-600 hover:text-yellow-800 underline cursor-pointer"
                  >
                    Browse Plans
                  </button>
                </div>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>

      {/* Plan Selection Modal — pass only the active subscription */}
      {showPlanModal && (
        <PlanModal
          isOpen={showPlanModal}
          onClose={handleModalClose}
          currentSubscription={activeSubscription}
          onSubscriptionUpdate={(newSubscription) => {
            // Add new subscription to history array and mark it active
            setSubscriptions((prev) => [
              // expire all previous active ones locally
              ...prev.map((s) =>
                s.status === "active" ? { ...s, status: "expired" } : s
              ),
              newSubscription,
            ]);
            handleModalClose();
          }}
        />
      )}
    </>
  );
}
