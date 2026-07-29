"use client";

import Link from "next/link";

/**
 * FileCloud brand logo — a stacked "folder ember" mark
 * Uses CSS variables so it adapts to light/dark themes.
 */
export function LogoMark({ size = 36, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fc-logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-hover)" />
          </linearGradient>
          <linearGradient id="fc-logo-flame" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFB27A" />
            <stop offset="0.55" stopColor="#FF7A2B" />
            <stop offset="1" stopColor="#EA4408" />
          </linearGradient>
        </defs>

        {/* Rounded square with brand color */}
        <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#fc-logo-bg)" />

        {/* Subtle grid */}
        <path
          d="M0 12 H40 M0 24 H40 M0 32 H40 M12 0 V40 M24 0 V40 M32 0 V40"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Ember mark — abstract folder/flame */}
        <path
          d="M13 26.5 C13 22 15.5 19 18.5 16.5 C19.5 18.5 20 20 20 21.5 C21.5 20 22.5 18 22.5 15 C25.5 17 27.5 20.5 27.5 24.2 C27.5 28 24.5 30.5 20.25 30.5 C16.5 30.5 13 29 13 26.5 Z"
          fill="url(#fc-logo-flame)"
        />

        {/* Inner highlight */}
        <path
          d="M18 26 C18 24 19 22.5 20.2 21.5 C20.6 22.6 20.8 23.4 20.8 24.2 C22 23.6 22.5 22.5 22.5 21 C23.5 22.2 24 23.6 24 25.1 C24 27 22.5 28.2 20.3 28.2 C18.8 28.2 18 27.4 18 26 Z"
          fill="#FFE7D2"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}

export default function Logo({
  size = 36,
  href = "/",
  showWord = true,
  className = "",
}) {
  const wordSize = size >= 40 ? "text-xl" : "text-[17px]";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 select-none group ${className}`}
      data-testid="brand-logo"
    >
      <LogoMark size={size} className="transition-transform group-hover:scale-[1.04]" />
      {showWord && (
        <span
          className={`${wordSize} font-extrabold tracking-tight fc-text leading-none`}
          style={{ letterSpacing: "-0.02em" }}
        >
          File<span style={{ color: "var(--accent)" }}>Cloud</span>
        </span>
      )}
    </Link>
  );
}
