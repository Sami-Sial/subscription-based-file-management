"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Loader from "@/components/Loader";

export default function Page({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
        setUser(data.data); // store user info

        // Redirect normal user
        if (data.data.role === "user") {
          window.location.href = "/user/dashboard";
          return;
        }
      } catch (err) {
        console.log("Auth error:", err);
        setUser(null);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex bg-white items-center justify-center h-screen w-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f6fa] overflow-hidden">
      {/* Sidebar handles both desktop sticky + mobile drawer */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Sticky topbar */}
        <Navbar
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
          user={user}
        />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
