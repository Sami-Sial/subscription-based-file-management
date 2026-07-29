"use client";

import Link from "next/link";
import { Github, Linkedin, Globe } from "lucide-react";
import Logo from "./Logo";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-24"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "var(--bg-inverse)",
        color: "var(--text-inverse)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2 flex flex-col gap-5 max-w-sm">
            <Logo size={36} />
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Enterprise-grade file &amp; folder management with subscription-based
              storage rules. Built for teams who care about structure and control.
            </p>
            <div className="flex items-center gap-2 mt-1">
              {[
                { href: "https://github.com/Sami-Sial", icon: Github, label: "GitHub" },
                { href: "https://www.linkedin.com/in/sami-ullah-b536a8338", icon: Linkedin, label: "LinkedIn" },
                { href: "https://sami-sial-portfolio.vercel.app", icon: Globe, label: "Portfolio" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(234,68,8,0.2)";
                    e.currentTarget.style.borderColor = "rgba(234,68,8,0.4)";
                    e.currentTarget.style.color = "#FF9A5C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.18em] mb-4"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Product
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/features", label: "Features" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/register", label: "Get started" },
                { href: "/login", label: "Sign in" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#FF9A5C"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.18em] mb-4"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Company
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/about", label: "About us" },
                { href: "/contact", label: "Contact us" },
                { href: "/terms", label: "Terms of service" },
                { href: "/privacy", label: "Privacy policy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#FF9A5C"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            © {year} FileCloud. Crafted with care by{" "}
            <a
              href="https://sami-sial-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#FF9A5C", fontWeight: 600 }}
            >
              Sami Ullah
            </a>
            .
          </p>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
