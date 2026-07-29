"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Users, BarChart2, Settings, Home, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: <Home size={15} />, href: "/admin/dashboard" },
  {
    label: "Subscriptions",
    icon: <Package size={15} />,
    href: "/admin/subscriptions",
  },
  { label: "User Management", icon: <Users size={15} />, href: "/admin/users" },
  // {
  //   label: "Analytics",
  //   icon: <BarChart2 size={15} />,
  //   href: "/admin/analytics",
  // },
  { label: "Settings", icon: <Settings size={15} />, href: "/admin/settings" },
];

function SidebarContent({ onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Package size={17} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 tracking-tight leading-none">
              FileCloud
            </span>
            <span className="text-[10px] text-rose-500 font-black tracking-wider uppercase mt-1">
              Admin Panel
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 transition lg:hidden cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto bg-white">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose ?? undefined}
              className="block"
            >
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none
                ${
                  isActive
                    ? "bg-slate-50 text-rose-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] border border-slate-100"
                    : "text-slate-600 border border-transparent hover:text-slate-900 hover:bg-slate-50/70"
                }`}
              >
                {/* Active Left Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-rose-600"
                  />
                )}

                <span
                  className={isActive ? "text-rose-600" : "text-slate-400 group-hover:text-slate-600 transition-colors"}
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
