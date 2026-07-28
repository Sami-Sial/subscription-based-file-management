"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { LogoMark } from "@/components/Logo";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const features = [
  {
    Icon: FolderTree,
    title: "Deep folder nesting",
    desc: "Organize data with unlimited hierarchy depth. Enforce structural discipline through subscription rules.",
  },
  {
    Icon: Lock,
    title: "Granular file policies",
    desc: "Control allowed file types, size limits, and per-folder capacity — all at the tier level.",
  },
  {
    Icon: Gauge,
    title: "Dynamic quotas",
    desc: "Storage capabilities scale automatically with each user's active subscription package.",
  },
  {
    Icon: Sliders,
    title: "Admin-defined rules",
    desc: "Every folder and file action is validated against your custom policy engine.",
  },
];

const steps = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up in seconds. Verify email. Choose a subscription plan that matches your storage needs.",
  },
  {
    num: "02",
    title: "Structure your drive",
    desc: "Build a folder tree that fits your team. Upload images, videos, audio and PDFs with instant previews.",
  },
  {
    num: "03",
    title: "Access anywhere",
    desc: "Manage, rename, download and organize your files from any device — securely, with real-time enforcement.",
  },
];

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/user/all-subscriptions`)
      .then((r) => r.json())
      .then((d) => setPlans(d.data || []))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  const popularId = (() => {
    const paid = [...plans]
      .filter((p) => (p.priceMonthly ?? 0) > 0)
      .sort((a, b) => b.priceMonthly - a.priceMonthly);
    return paid.length >= 2 ? paid[1].id : paid[0]?.id ?? null;
  })();

  return (
    <div className="min-h-screen fc-canvas">
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 fc-grid-bg pointer-events-none opacity-70" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--accent) 0%, transparent 55%)",
            opacity: 0.14,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
          <div
            className="flex flex-col items-center text-center gap-7 max-w-4xl mx-auto fc-anim-fadeUp"
          >
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] fc-shadow-sm"
              style={{
                background: "var(--accent-soft)",
                color: "var(--accent)",
                border: "1px solid var(--accent-ring)",
              }}
            >
              <Sparkles size={12} />
              Enterprise storage · built with discipline
            </span>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold fc-text tracking-tight leading-[0.95]"
              style={{ letterSpacing: "-0.035em" }}
            >
              Storage that follows{" "}
              <span className="fc-gradient-text">your rules.</span>
            </h1>

            <p className="text-base md:text-lg fc-text-tertiary max-w-2xl leading-relaxed">
              FileCloud enforces every folder, file type, and quota at the
              backend — so your subscription plan is the single source of truth.
              No surprises. No overages.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <Link
                href="/register"
                data-testid="hero-primary-cta"
                className="fc-btn-accent h-12 px-7 rounded-2xl text-sm font-bold inline-flex items-center gap-2"
              >
                Start free
                <ArrowRight size={16} />
              </Link>
              <a
                href="#pricing"
                data-testid="hero-pricing-cta"
                className="fc-btn-ghost h-12 px-7 rounded-2xl text-sm font-bold inline-flex items-center gap-2"
              >
                See pricing
              </a>
            </div>

            <div className="flex items-center gap-6 pt-6 flex-wrap justify-center">
              {[
                { Icon: ShieldCheck, label: "Backend-enforced quotas" },
                { Icon: Layers, label: "Unlimited nesting" },
                { Icon: Zap, label: "Instant activation" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs fc-text-tertiary"
                >
                  <Icon size={14} className="fc-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Floating logo mark */}
          <div
            className="hidden md:block absolute top-24 right-8 opacity-20 pointer-events-none fc-anim-float"
          >
            <LogoMark size={140} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">
              Capabilities
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Every action, validated against your plan.
            </h2>
            <p className="text-base fc-text-tertiary mt-4 leading-relaxed">
              Admins define the rules. Users work within them. Every folder
              create, every file upload — checked in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="fc-card p-6 group"
                data-testid={`feature-card-${i}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold fc-text mb-2">{title}</h3>
                <p className="text-[13px] fc-text-tertiary leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 md:py-28 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="absolute inset-0 fc-dot-bg opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">
              Workflow
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Three steps to a structured drive.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="fc-card p-8 relative"
              >
                <div
                  className="text-5xl font-black fc-gradient-text mb-4 leading-none"
                  style={{ letterSpacing: "-0.05em" }}
                >
                  {step.num}
                </div>
                <h4 className="text-lg font-bold fc-text mb-2">{step.title}</h4>
                <p className="text-sm fc-text-tertiary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">
              Pricing
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Simple plans. Real limits.
            </h2>
            <p className="text-base fc-text-tertiary mt-4">
              Every plan enforces its rules at the backend. Upgrade any time.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-24">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center fc-text-muted py-16 text-sm">
              No plans available at the moment.
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {plans.map((plan, i) => {
                const isPopular = plan.id === popularId;
                const types = Array.isArray(plan.allowedTypes)
                  ? plan.allowedTypes
                  : [];

                const rows = [
                  { text: `${plan.maxFolders} max folders`, ok: true },
                  { text: `${plan.maxNesting} nesting levels`, ok: true },
                  {
                    text: `${plan.maxFileSizeMB} MB per file`,
                    ok: true,
                  },
                  { text: `${plan.totalFileLimit} total files`, ok: true },
                  {
                    text: `${plan.filesPerFolder} files per folder`,
                    ok: true,
                  },
                  {
                    text: types.length
                      ? types
                          .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                          .join(", ")
                      : "No file types allowed",
                    ok: types.length > 0,
                  },
                ];

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative flex flex-col rounded-2xl p-7 w-full sm:w-[280px] transition-all duration-300 ${
                      isPopular ? "fc-shadow-glow" : "fc-card"
                    }`}
                    style={
                      isPopular
                        ? {
                            background: "var(--bg-inverse)",
                            border: "1px solid var(--accent)",
                          }
                        : {}
                    }
                    data-testid={`pricing-plan-${plan.name?.toLowerCase()}`}
                  >
                    {isPopular && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] shadow-lg"
                        style={{
                          background: "var(--accent)",
                          color: "white",
                        }}
                      >
                        Recommended
                      </span>
                    )}

                    <div className="mb-6">
                      <h3
                        className="text-base font-bold uppercase tracking-widest mb-3"
                        style={{
                          color: isPopular
                            ? "var(--text-inverse)"
                            : "var(--text-tertiary)",
                        }}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-5xl font-extrabold tracking-tight"
                          style={{
                            color: isPopular
                              ? "var(--text-inverse)"
                              : "var(--text-primary)",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          ${plan.priceMonthly ?? 0}
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: isPopular
                              ? "rgba(255,255,255,0.55)"
                              : "var(--text-muted)",
                          }}
                        >
                          /mo
                        </span>
                      </div>
                    </div>

                    <ul className="flex flex-col gap-3 mb-8 flex-1">
                      {rows.map((f, fi) => (
                        <li
                          key={fi}
                          className="flex items-start gap-2.5 text-[13px]"
                          style={{
                            color: !f.ok
                              ? isPopular
                                ? "rgba(255,255,255,0.35)"
                                : "var(--text-muted)"
                              : isPopular
                              ? "rgba(255,255,255,0.9)"
                              : "var(--text-secondary)",
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: f.ok
                                ? isPopular
                                  ? "var(--accent)"
                                  : "var(--accent-soft)"
                                : "transparent",
                              color: f.ok
                                ? isPopular
                                  ? "white"
                                  : "var(--accent)"
                                : "var(--text-muted)",
                              border: !f.ok ? "1px solid currentColor" : "none",
                            }}
                          >
                            {f.ok ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                          </span>
                          <span className={!f.ok ? "line-through" : ""}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/register"
                      className={`w-full h-11 rounded-xl font-bold text-[13px] inline-flex items-center justify-center gap-1.5 transition-all ${
                        isPopular ? "fc-btn-accent" : "fc-btn-primary"
                      }`}
                    >
                      {(plan.priceMonthly ?? 0) === 0
                        ? "Get started free"
                        : `Choose ${plan.name}`}
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div
            className="rounded-3xl p-10 md:p-14 relative overflow-hidden fc-noise"
            style={{
              background: "var(--bg-inverse)",
              border: "1px solid var(--border-strong)",
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3
                  className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
                  style={{
                    color: "var(--text-inverse)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ready to bring structure to your storage?
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Get started free. Upgrade when you outgrow it.
                </p>
              </div>
              <Link
                href="/register"
                className="fc-btn-accent h-12 px-7 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shrink-0"
              >
                Create free account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
