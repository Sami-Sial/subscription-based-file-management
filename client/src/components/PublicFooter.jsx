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
        borderColor: "var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 flex flex-col gap-5 max-w-sm">
            <Logo size={36} />
            <p className="text-sm leading-relaxed fc-text-tertiary">
              Enterprise-grade file & folder management with subscription-based
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
                  className="w-9 h-9 inline-flex items-center justify-center rounded-xl fc-btn-ghost"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] fc-text-muted mb-4">
              Product
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/#features", label: "Features" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/register", label: "Get started" },
                { href: "/login", label: "Sign in" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm fc-text-secondary hover:fc-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] fc-text-muted mb-4">
              Company
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/about", label: "About us" },
                { href: "/terms", label: "Terms of service" },
                { href: "/privacy", label: "Privacy policy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm fc-text-secondary hover:fc-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-xs fc-text-tertiary">
            © {year} FileCloud. Crafted with care by{" "}
            <a
              href="https://sami-sial-portfolio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="fc-accent font-semibold hover:underline"
            >
              Sami Ullah
            </a>
            .
          </p>
          <div className="flex items-center gap-4 text-[11px] fc-text-muted">
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
