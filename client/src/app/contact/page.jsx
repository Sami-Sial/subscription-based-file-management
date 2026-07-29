"use client";

import Link from "next/link";
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Globe,
  HelpCircle,
  Phone,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const contactChannels = [
  {
    Icon: Mail,
    label: "Email",
    value: "smisial1555@gmail.com",
    href: "mailto:smisial1555@gmail.com",
  },
  {
    Icon: Phone,
    label: "WhatsApp",
    value: "+92 314 618 0920",
    href: "https://wa.me/923146180920",
  },
  {
    Icon: Globe,
    label: "Website",
    value: "sami-sial-portfolio.vercel.app",
    href: "https://sami-sial-portfolio.vercel.app",
  },
  {
    Icon: Clock,
    label: "Response time",
    value: "Within 24 hours",
  },
];

const reasons = [
  { title: "General inquiry", desc: "Questions about the product, pricing, or how something works." },
  { title: "Sales & upgrades", desc: "Interested in a higher plan or need a custom quota configuration." },
  { title: "Technical support", desc: "Something isn't working the way you expected — we'll dig in." },
  { title: "Partnership", desc: "You'd like to integrate, resell, or collaborate on FileCloud." },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen fc-canvas">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-14 md:pt-24 md:pb-16">
        <div className="absolute inset-0 fc-grid-bg opacity-60 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] mb-5"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent-ring)",
            }}
          >
            <MessageSquare size={12} /> Contact us
          </span>
          <h1
            className="font-extrabold fc-text tracking-tight leading-[1.05] mb-5"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", letterSpacing: "-0.04em" }}
          >
            Let&apos;s talk about your <span className="fc-gradient-text">storage.</span>
          </h1>
          <p className="text-base md:text-lg fc-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Questions, feedback, partnerships, or an idea for a feature —
            reach out directly and we&apos;ll get back to you within a day.
          </p>
        </div>
      </section>

      {/* Contact info */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-10 flex flex-col gap-6">

          {/* Reach us directly */}
          <div className="fc-card p-7">
            <p className="text-[11px] font-black uppercase tracking-widest fc-accent mb-6">
              Reach us directly
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {contactChannels.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest fc-text-muted">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm font-bold fc-text hover:fc-accent transition-colors break-all"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-bold fc-text">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need help right now */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: "var(--bg-inverse)", color: "var(--text-inverse)" }}
          >
            <div
              className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl inline-flex items-center justify-center mb-4"
                style={{ background: "rgba(255,122,43,0.15)", color: "#FF9A5C" }}
              >
                <HelpCircle size={17} />
              </div>
              <p className="text-base font-bold mb-2">Need help right now?</p>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
                Most common questions are answered on our features page and homepage FAQ.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/features"
                  className="fc-btn-accent h-9 px-4 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                >
                  See features
                </Link>
                <Link
                  href="/#faq"
                  className="h-9 px-4 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  Read FAQ
                </Link>
              </div>
            </div>
          </div>

          {/* Reasons */}
          <div className="fc-card p-7">
            <p className="text-[11px] font-black uppercase tracking-widest fc-accent mb-4">
              Reasons people write in
            </p>
            <ul className="space-y-3">
              {reasons.map((r) => (
                <li key={r.title} className="flex gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                  <div>
                    <p className="text-[13px] font-bold fc-text">{r.title}</p>
                    <p className="text-[12px] fc-text-tertiary mt-0.5 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
