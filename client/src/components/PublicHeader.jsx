"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About us", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "fc-glass" : ""
      }`}
      style={{
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Logo size={34} />

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold fc-text-secondary hover:fc-text transition-colors"
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            data-testid="header-login-btn"
            className="hidden sm:inline-flex fc-btn-ghost items-center h-9 px-4 rounded-xl text-[13px] font-semibold"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            data-testid="header-signup-btn"
            className="fc-btn-accent inline-flex items-center h-9 px-4 rounded-xl text-[13px] font-semibold"
          >
            Get started
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 inline-flex items-center justify-center fc-btn-ghost rounded-xl"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <div className="px-5 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium fc-text-secondary hover:fc-surface-2"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 fc-btn-ghost h-10 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
