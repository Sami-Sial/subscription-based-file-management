"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Users,
  Settings,
  LayoutDashboard,
  X,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Subscriptions", icon: Package, href: "/admin/subscriptions" },
  { label: "Users", icon: Users, href: "/admin/users" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

function SidebarContent({ onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Brand */}
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Logo size={32} href="/admin/dashboard" />
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 inline-flex items-center justify-center fc-btn-ghost rounded-lg lg:hidden"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Role pill */}
      <div className="px-5 py-4 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-ring)",
          }}
        >
          <ShieldCheck size={14} className="fc-accent" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest fc-accent">
              Admin console
            </p>
            <p className="text-[11px] fc-text-tertiary truncate">
              Full platform control
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose ?? undefined}
              data-testid={`admin-nav-${item.label.toLowerCase()}`}
            >
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
                  isActive ? "fc-text" : "fc-text-tertiary hover:fc-text"
                }`}
                style={
                  isActive
                    ? {
                        background: "var(--bg-surface-2)",
                      }
                    : {}
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                <Icon
                  size={16}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                  }}
                />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div
        className="px-5 py-4 border-t shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest fc-text-muted mb-1">
          Version
        </p>
        <p className="text-xs fc-text-secondary font-mono">FileCloud v1.0</p>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside
        className="hidden lg:flex w-[240px] flex-col shrink-0 h-screen sticky top-0 border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <SidebarContent onClose={null} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(10, 14, 28, 0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 h-full w-[280px] flex flex-col z-50 lg:hidden fc-shadow-lg"
              style={{
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border-subtle)",
              }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
