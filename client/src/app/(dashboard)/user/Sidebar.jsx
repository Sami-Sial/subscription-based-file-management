"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  HardDrive,
  Clock,
  Settings,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/user/dashboard" },
  { label: "My Drive", icon: HardDrive, href: "/user/drive" },
  { label: "Recent", icon: Clock, href: "/user/recent" },
  { label: "Subscriptions", icon: Package, href: "/user/subscriptions" },
  { label: "Settings", icon: Settings, href: "/user/settings" },
];

function fmtMB(mb) {
  if (mb === 0) return "0 MB";
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function StorageWidget({ storageStats }) {
  const { usedMB = 0, maxStorageGB = 0, usedPct = 0 } = storageStats || {};
  const isUnlimited = maxStorageGB === 0;

  const barColor =
    usedPct >= 90
      ? "#f43f5e"
      : usedPct >= 70
      ? "#f59e0b"
      : "var(--accent)";

  return (
    <div
      className="px-4 py-4 border-t shrink-0"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="rounded-xl p-3 space-y-2.5"
        style={{
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardDrive size={11} style={{ color: "var(--accent)" }} />
            <span className="text-[10px] font-black uppercase tracking-widest fc-text-muted">
              Storage
            </span>
          </div>
          {!isUnlimited && (
            <span
              className="text-[10px] font-bold tabular-nums"
              style={{ color: barColor }}
            >
              {usedPct}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isUnlimited ? (
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--border-subtle)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: barColor }}
            />
          </div>
        ) : (
          <div
            className="h-1.5 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--accent) 0%, #8b5cf6 100%)",
              opacity: 0.3,
            }}
          />
        )}

        {/* Usage numbers */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold fc-text-secondary tabular-nums">
            {fmtMB(usedMB)}
          </span>
          <span className="text-[10px] fc-text-muted">
            {isUnlimited ? "Unlimited" : `of ${maxStorageGB} GB`}
          </span>
        </div>
      </div>

      {/* Version */}
      <p className="text-[10px] font-black uppercase tracking-widest fc-text-muted mt-3 mb-1">
        Version
      </p>
      <p className="text-xs fc-text-secondary font-mono">FileCloud v1.0</p>
    </div>
  );
}

function SidebarContent({ onClose, storageStats }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Logo size={32} href="/user/dashboard" />
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

      <div className="px-5 py-4 shrink-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--accent-soft)" }}
          >
            <HardDrive size={12} className="fc-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest fc-text-tertiary">
              Your workspace
            </p>
            <p className="text-[11px] fc-text-secondary truncate font-medium">
              Personal drive
            </p>
          </div>
        </div>
      </div>

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
              data-testid={`user-nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${
                  isActive ? "fc-text" : "fc-text-tertiary hover:fc-text"
                }`}
                style={isActive ? { background: "var(--bg-surface-2)" } : {}}
              >
                {isActive && (
                  <motion.div
                    layoutId="user-active-bar"
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

      <StorageWidget storageStats={storageStats} />
    </>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen, storageStats }) {
  return (
    <>
      <aside
        className="hidden lg:flex w-[240px] flex-col shrink-0 h-screen sticky top-0 border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <SidebarContent onClose={null} storageStats={storageStats} />
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
              style={{
                background: "rgba(10, 14, 28, 0.5)",
                backdropFilter: "blur(4px)",
              }}
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
              <SidebarContent
                onClose={() => setMobileOpen(false)}
                storageStats={storageStats}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
