"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Menu, X, Settings, LogOut, Folder } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ onMenuToggle }) {
  const [searchOpen, setSearchOpen] = useState(false);
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

      {/* Search */}
      <div className="flex-1 relative">
        <div className="hidden sm:block relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            placeholder="Search packages or users..."
            className="w-full max-w-[360px] pl-8 pr-4 py-2 text-[12px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 placeholder-gray-400 transition-all"
          />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                className="relative overflow-hidden"
              >
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  autoFocus
                  placeholder="Search..."
                  className="w-full pl-8 pr-4 py-2 text-[12px] text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 placeholder-gray-400 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
          >
            {searchOpen ? <X size={16} /> : <Search size={16} />}
          </motion.button>
        </div>
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
