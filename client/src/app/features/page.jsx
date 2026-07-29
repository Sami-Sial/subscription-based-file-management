"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderTree,
  Lock,
  Gauge,
  Sliders,
  Check,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
  Cloud,
  Cpu,
  CreditCard,
  Upload,
  Image,
  FileText,
  Music,
  Video,
  UserPlus,
  FolderOpen,
  Search,
  Trash2,
  Download,
  Bell,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const platformFeatures = [
  {
    Icon: FolderTree,
    title: "Unlimited folder nesting (per plan)",
    desc: "Build a folder tree as deep as your subscription allows. Every 'create folder' request is validated against your plan's max nesting depth in real time.",
  },
  {
    Icon: Lock,
    title: "File-type policy engine",
    desc: "Only the file formats your plan permits are accepted. Everything else is rejected before it reaches storage — no wasted bandwidth, no silent failures.",
  },
  {
    Icon: Gauge,
    title: "Live quota tracking",
    desc: "See how many folders, files, and MB you've used against your plan's limits — updated the moment an upload finishes.",
  },
  {
    Icon: Cloud,
    title: "Cloudinary-powered storage",
    desc: "All uploaded media lives on Cloudinary with global CDN delivery and automatic format optimisation for images.",
  },
  {
    Icon: ShieldCheck,
    title: "OTP email verification",
    desc: "Every account is verified via 6-digit code before any upload is permitted. Prevents abuse from throwaway signups.",
  },
  {
    Icon: CreditCard,
    title: "Stripe-managed billing",
    desc: "Upgrade, downgrade, cancel, or update your card without ever leaving FileCloud. Webhooks keep your access in sync.",
  },
  {
    Icon: Cpu,
    title: "Backend-first enforcement",
    desc: "Rules never trust the browser. Node/Express + Prisma validates every folder, file, size, type, and quota on every request.",
  },
  {
    Icon: Sliders,
    title: "Admin-configured rules",
    desc: "Admins can create, edit, or archive subscription tiers — changing folder caps, allowed formats, or per-file limits without a redeploy.",
  },
  {
    Icon: Bell,
    title: "Clear error feedback",
    desc: "Rejected uploads come back with a plain-English reason: 'File too large for your plan', 'Folder limit reached', etc.",
  },
  {
    Icon: Layers,
    title: "Multi-level hierarchies",
    desc: "Nest folders inside folders inside folders — as many levels as your plan permits. Great for agencies and multi-project teams.",
  },
  {
    Icon: Upload,
    title: "Drag & drop uploads",
    desc: "Modern file picker with drag-and-drop, multi-select, and inline preview for images, PDFs, videos, and audio.",
  },
  {
    Icon: Zap,
    title: "Instant plan activation",
    desc: "The moment your Stripe payment succeeds, new limits apply. No re-login, no wait, no cache clearing.",
  },
];

const dashboardFeatures = [
  { Icon: FolderOpen, label: "Personal drive with folder tree browser" },
  { Icon: Upload, label: "Drag & drop uploads with instant validation" },
  { Icon: Search, label: "Search across folders and files" },
  { Icon: Download, label: "One-click file downloads via Cloudinary CDN" },
  { Icon: Trash2, label: "Safe delete with confirmation dialogs" },
  { Icon: Gauge, label: "Live usage dashboard with quota bars" },
];

const fileTypeIcons = {
  image: Image,
  pdf: FileText,
  video: Video,
  audio: Music,
};

export default function FeaturesPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!BASE) { setLoading(false); return; }
    fetch(`${BASE}/api/user/all-subscriptions`)
      .then((r) => r.json())
      .then((d) => setPlans(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // sort plans by monthly price ascending
  const sortedPlans = [...plans].sort(
    (a, b) => (a.priceMonthly ?? 0) - (b.priceMonthly ?? 0)
  );

  const rowSpec = [
    { label: "Monthly price", key: "priceMonthly", format: (v) => `$${v ?? 0}` },
    { label: "Max folders", key: "maxFolders" },
    { label: "Nesting depth", key: "maxNesting" },
    { label: "Max file size", key: "maxFileSizeMB", format: (v) => `${v} MB` },
    { label: "Total files", key: "totalFileLimit" },
    { label: "Files per folder", key: "filesPerFolder" },
  ];

  const allTypes = ["image", "pdf", "video", "audio"];

  return (
    <div className="min-h-screen fc-canvas">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-14 md:pt-24 md:pb-16">
        <div className="absolute inset-0 fc-grid-bg opacity-60 pointer-events-none" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 55%)", opacity: 0.12 }}
        />

        <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] mb-5"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent-ring)",
            }}
          >
            <Sparkles size={12} /> Features
          </span>
          <h1
            className="text-4xl md:text-6xl font-extrabold fc-text tracking-tight leading-[1.02] mb-5"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything you get with{" "}
            <span className="fc-gradient-text">FileCloud.</span>
          </h1>
          <p className="text-base md:text-lg fc-text-tertiary max-w-2xl mx-auto leading-relaxed">
            A file management platform where subscription tiers actually mean
            something. Explore what's included, plan-by-plan.
          </p>
        </div>
      </section>

      {/* Platform features grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Platform</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              12 capabilities available on every plan.
            </h2>
            <p className="text-base fc-text-tertiary mt-4 leading-relaxed">
              The core FileCloud experience is the same everywhere. Only the
              quotas differ from tier to tier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformFeatures.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 3) * 0.06 }}
                className="fc-card p-6 group"
                data-testid={`platform-feature-${i}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-[15px] font-bold fc-text mb-2">{title}</h3>
                <p className="text-[13px] fc-text-tertiary leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan comparison */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="absolute inset-0 fc-dot-bg opacity-50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Plan comparison</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Compare every plan side-by-side.
            </h2>
            <p className="text-base fc-text-tertiary mt-4">
              Quotas and allowed file formats for each subscription tier.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="text-center py-20 fc-card max-w-lg mx-auto p-10">
              <p className="text-sm fc-text-tertiary">
                Plans could not be loaded right now. Please check back in a
                moment, or{" "}
                <Link href="/contact" className="fc-accent font-bold hover:underline">
                  contact us
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              {/* Table (desktop) */}
              <div
                className="hidden md:block overflow-x-auto fc-card"
                style={{ padding: 0 }}
              >
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "var(--bg-surface-2)" }}>
                      <th
                        className="text-left px-6 py-5 text-[11px] font-black uppercase tracking-widest fc-text-tertiary"
                        style={{ minWidth: 200 }}
                      >
                        Capability
                      </th>
                      {sortedPlans.map((p) => (
                        <th
                          key={p.id}
                          className="text-center px-6 py-5"
                        >
                          <div className="text-[11px] font-black uppercase tracking-widest fc-text-tertiary mb-1">
                            {p.name}
                          </div>
                          <div
                            className="text-2xl font-extrabold fc-text tracking-tight"
                            style={{ letterSpacing: "-0.02em" }}
                          >
                            ${p.priceMonthly ?? 0}
                            <span className="text-xs font-medium fc-text-muted">/mo</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowSpec.slice(1).map((row, ri) => (
                      <tr
                        key={row.key}
                        className="border-t"
                        style={{ borderColor: "var(--border-subtle)" }}
                      >
                        <td className="px-6 py-4 text-[13px] font-semibold fc-text">
                          {row.label}
                        </td>
                        {sortedPlans.map((p) => (
                          <td
                            key={p.id}
                            className="px-6 py-4 text-center text-[13.5px] font-bold fc-text"
                          >
                            {row.format ? row.format(p[row.key]) : p[row.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* File type rows */}
                    {allTypes.map((type) => {
                      const Icon = fileTypeIcons[type];
                      return (
                        <tr
                          key={type}
                          className="border-t"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <td className="px-6 py-4 text-[13px] font-semibold fc-text">
                            <span className="inline-flex items-center gap-2">
                              <Icon size={14} className="fc-accent" />
                              {type.charAt(0).toUpperCase() + type.slice(1)} files
                            </span>
                          </td>
                          {sortedPlans.map((p) => {
                            const has = Array.isArray(p.allowedTypes) && p.allowedTypes.includes(type);
                            return (
                              <td key={p.id} className="px-6 py-4 text-center">
                                {has ? (
                                  <span
                                    className="inline-flex w-6 h-6 items-center justify-center rounded-md"
                                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                                  >
                                    <Check size={13} strokeWidth={3} />
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex w-6 h-6 items-center justify-center rounded-md"
                                    style={{ background: "var(--bg-surface-2)", color: "var(--text-muted)" }}
                                  >
                                    <X size={13} />
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    <tr
                      className="border-t"
                      style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface-2)" }}
                    >
                      <td className="px-6 py-4"></td>
                      {sortedPlans.map((p) => (
                        <td key={p.id} className="px-6 py-4 text-center">
                          <Link
                            href="/register"
                            className={`inline-flex items-center justify-center h-9 px-4 rounded-xl text-[12px] font-bold gap-1 ${
                              (p.priceMonthly ?? 0) === 0 ? "fc-btn-ghost" : "fc-btn-accent"
                            }`}
                          >
                            {(p.priceMonthly ?? 0) === 0 ? "Start free" : `Choose ${p.name}`}
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cards (mobile) */}
              <div className="md:hidden flex flex-col gap-5">
                {sortedPlans.map((p) => (
                  <div key={p.id} className="fc-card p-6">
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest fc-text-tertiary mb-1">
                          {p.name}
                        </p>
                        <p
                          className="text-3xl font-extrabold fc-text tracking-tight"
                          style={{ letterSpacing: "-0.03em" }}
                        >
                          ${p.priceMonthly ?? 0}
                          <span className="text-sm font-medium fc-text-muted">/mo</span>
                        </p>
                      </div>
                      <Link
                        href="/register"
                        className={`h-9 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1 ${
                          (p.priceMonthly ?? 0) === 0 ? "fc-btn-ghost" : "fc-btn-accent"
                        }`}
                      >
                        {(p.priceMonthly ?? 0) === 0 ? "Free" : "Choose"}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {rowSpec.slice(1).map((row) => (
                        <li
                          key={row.key}
                          className="flex items-center justify-between text-[13px] pb-2 border-b"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <span className="fc-text-tertiary">{row.label}</span>
                          <span className="fc-text font-bold">
                            {row.format ? row.format(p[row.key]) : p[row.key]}
                          </span>
                        </li>
                      ))}
                      <li className="pt-1">
                        <p className="text-[11px] font-black uppercase tracking-widest fc-text-tertiary mb-2">
                          Allowed file types
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {allTypes.map((t) => {
                            const has = Array.isArray(p.allowedTypes) && p.allowedTypes.includes(t);
                            const Icon = fileTypeIcons[t];
                            return (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                                style={{
                                  background: has ? "var(--accent-soft)" : "var(--bg-surface-2)",
                                  color: has ? "var(--accent)" : "var(--text-muted)",
                                  textDecoration: has ? "none" : "line-through",
                                }}
                              >
                                <Icon size={11} />
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dashboard features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Inside your dashboard</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              A cockpit built for real work.
            </h2>
            <p className="text-base fc-text-tertiary mt-4 leading-relaxed">
              Once you're in, everything is one click away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardFeatures.map(({ Icon, label }, i) => (
              <div key={label} className="fc-card p-5 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={17} />
                </div>
                <p className="text-[14px] font-semibold fc-text">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div
            className="rounded-3xl p-10 text-center fc-card"
            style={{ background: "var(--bg-surface)" }}
          >
            <h3
              className="text-2xl md:text-3xl font-extrabold fc-text tracking-tight mb-3"
              style={{ letterSpacing: "-0.02em" }}
            >
              Pick your plan and start uploading in minutes.
            </h3>
            <p className="text-sm fc-text-tertiary max-w-md mx-auto mb-6">
              Free forever on the entry tier. Upgrade the moment you outgrow it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="fc-btn-accent h-11 px-6 rounded-xl text-sm font-bold inline-flex items-center gap-2"
              >
                Get started free <ArrowRight size={14} />
              </Link>
              <Link
                href="/#pricing"
                className="fc-btn-ghost h-11 px-6 rounded-xl text-sm font-bold inline-flex items-center gap-2"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
