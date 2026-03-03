"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ onMenuToggle }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);

      localStorage.removeItem("token");

      // small delay for UX
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-30"
    >
      {/* Hamburger */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
      >
        <Menu size={18} />
      </motion.button>

      {/* Welcome Text */}
      <div className="flex-1">
        <p className="text-lg font-extrabold">Welcome back 👋</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/user/settings")}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
        >
          <Settings size={17} />
        </motion.button>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors shadow-sm cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
