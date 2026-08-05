"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Settings, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ onMenuToggle, user, role = "user" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    try {
      setLoading(true);
      localStorage.removeItem("token");
      setTimeout(() => router.push("/login"), 600);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || (role === "admin" ? "Admin" : "there");
  const initial = (user?.name?.[0] || "U").toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b"
      style={{
        background: "color-mix(in oklab, var(--bg-surface) 85%, transparent)",
        borderColor: "var(--border-subtle)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-xl fc-btn-ghost"
        aria-label="Menu"
        data-testid="mobile-menu-btn"
      >
        <Menu size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-widest fc-text-muted leading-none">
          {role === "admin" ? "Administrator" : "Welcome"}
        </p>
        <p className="text-sm sm:text-base font-bold fc-text truncate mt-0.5">
          Hi, {firstName}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push(`/${role}/settings`)}
          className="w-9 h-9 inline-flex items-center justify-center rounded-xl fc-btn-ghost"
          aria-label="Settings"
          data-testid="navbar-settings-btn"
        >
          <Settings size={15} />
        </button>


        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          disabled={loading}
          data-testid="navbar-logout-btn"
          className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-60"
          style={{ background: "#dc2626" }}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <>
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
