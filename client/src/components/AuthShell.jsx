"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Shared shell used by all auth pages: Login, Register, Forgot, Reset, OTP.
 * Provides a two-column layout with brand storytelling on the left
 * and the form (children) on the right.
 */
export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  bullets,
  children,
  footer,
}) {
  const defaultBullets = [
    { Icon: ShieldCheck, text: "Backend-enforced quotas" },
    { Icon: Zap, text: "Instant folder & file operations" },
    { Icon: Sparkles, text: "Free tier available" },
  ];
  const items = bullets || defaultBullets;

  return (
    <div className="min-h-screen fc-canvas grid lg:grid-cols-[1fr_1.05fr]">
      {/* ── Brand side ── */}
      <aside
        className="hidden lg:flex relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
        style={{
          background: "var(--bg-inverse)",
          color: "var(--text-inverse)",
        }}
      >
        <div className="absolute inset-0 fc-grid-bg opacity-40 pointer-events-none" />
        <div
          className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--accent)", opacity: 0.22 }}
        />

        <div className="relative flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            data-testid="auth-brand-link"
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="auth-flame" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#FFB27A" />
                    <stop offset="0.55" stopColor="#FF7A2B" />
                    <stop offset="1" stopColor="#EA4408" />
                  </linearGradient>
                </defs>
                <path
                  d="M13 26.5 C13 22 15.5 19 18.5 16.5 C19.5 18.5 20 20 20 21.5 C21.5 20 22.5 18 22.5 15 C25.5 17 27.5 20.5 27.5 24.2 C27.5 28 24.5 30.5 20.25 30.5 C16.5 30.5 13 29 13 26.5 Z"
                  fill="url(#auth-flame)"
                />
              </svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              File<span style={{ color: "#FF7A2B" }}>Cloud</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          {eyebrow && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] mb-5"
              style={{
                background: "rgba(255, 122, 43, 0.15)",
                color: "#FF9A5C",
                border: "1px solid rgba(255,122,43,0.28)",
              }}
            >
              {eyebrow}
            </span>
          )}
          <h2
            className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.05] mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            {title || (
              <>
                Storage that <span style={{ color: "#FF7A2B" }}>respects</span> the rules.
              </>
            )}
          </h2>
          <p
            className="text-sm xl:text-base leading-relaxed max-w-md"
            style={{ color: "rgba(255,255,255,0.62)" }}
          >
            {subtitle ||
              "FileCloud enforces every folder, file type, and quota at the backend. Your subscription plan is the source of truth."}
          </p>

          <ul className="mt-8 space-y-3">
            {items.map(({ Icon, text }, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255, 122, 43, 0.14)",
                    color: "#FF9A5C",
                  }}
                >
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center justify-between text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          <p>© {new Date().getFullYear()} FileCloud — All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </aside>

      {/* ── Form side ── */}
      <main className="relative flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 md:px-10 h-16">
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 text-sm font-semibold fc-text-secondary hover:fc-text"
          >
            <ArrowLeft size={14} /> Back home
          </Link>
          <div className="hidden lg:flex items-center gap-2 text-xs fc-text-muted">
            <span>Not the right page?</span>
          </div>
          <ThemeToggle size="sm" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-10">
          <div className="w-full max-w-[440px]">
            {children}
          </div>
        </div>

        {footer && (
          <div className="px-6 md:px-10 pb-8 text-center">{footer}</div>
        )}
      </main>
    </div>
  );
}
