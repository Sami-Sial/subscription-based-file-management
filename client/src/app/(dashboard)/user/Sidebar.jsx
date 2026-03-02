"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Users, BarChart2, Settings, Home, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: <Home size={18} />, href: "/user/dashboard" },
  {
    label: "Subscriptions",
    icon: <Package size={18} />,
    href: "/user/subscriptions",
  },
  { label: "My Drive", icon: <Users size={18} />, href: "/user/drive" },
  {
    label: "Recent",
    icon: <BarChart2 size={18} />,
    href: "/user/recent",
  },
  { label: "Settings", icon: <Settings size={18} />, href: "/user/settings" },
];

function SidebarContent({ onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
        <Link href="/user/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition">
            <Home size={18} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-wide">
            User Console
          </span>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-100 text-gray-500 transition lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose ?? undefined}
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all cursor-pointer
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {/* Active Left Border */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600"
                  />
                )}

                <span
                  className={isActive ? "text-indigo-600" : "text-gray-400"}
                >
                  {item.icon}
                </span>

                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-[250px] bg-white border-r border-gray-100 flex-col shrink-0 h-screen sticky top-0 shadow-sm"
      >
        <SidebarContent onClose={null} />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[300px] bg-white border-r border-gray-100 flex flex-col z-50 lg:hidden shadow-lg"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
