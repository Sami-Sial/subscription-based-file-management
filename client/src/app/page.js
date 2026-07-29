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
  UserPlus,
  CreditCard,
  Upload,
  Rocket,
  Cloud,
  Cpu,
  Database,
  Globe2,
  Quote,
  ChevronDown,
  Star,
  Users,
  Briefcase,
  Camera,
  Music,
  Video,
  FileText,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { LogoMark } from "@/components/Logo";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const features = [
  { Icon: FolderTree, title: "Deep folder nesting", desc: "Organize data with unlimited hierarchy depth. Enforce structural discipline through subscription rules." },
  { Icon: Lock, title: "Granular file policies", desc: "Control allowed file types, size limits, and per-folder capacity — all at the tier level." },
  { Icon: Gauge, title: "Dynamic quotas", desc: "Storage capabilities scale automatically with each user's active subscription package." },
  { Icon: Sliders, title: "Admin-defined rules", desc: "Every folder and file action is validated against your custom policy engine." },
  { Icon: Cloud, title: "Cloudinary storage", desc: "Files are stored on Cloudinary's global CDN with automatic optimisation and delivery." },
  { Icon: ShieldCheck, title: "OTP-verified accounts", desc: "Every new account is verified via one-time password before it can upload a single byte." },
  { Icon: CreditCard, title: "Stripe subscriptions", desc: "Upgrade, downgrade, or cancel plans through a secure Stripe-managed billing portal." },
  { Icon: Cpu, title: "Backend-first enforcement", desc: "Rules are never trusted from the client. Every operation is re-validated server-side." },
];

const steps = [
  { num: "01", Icon: UserPlus, title: "Create your account", desc: "Sign up in seconds with just your name, email and password. Verify via OTP delivered to your inbox — no upload is allowed before verification." },
  { num: "02", Icon: CreditCard, title: "Pick a plan", desc: "Start free, or choose Silver, Gold or Diamond for higher quotas. Each plan's limits are locked in at the API level — not just the UI." },
  { num: "03", Icon: FolderTree, title: "Structure your drive", desc: "Build folder trees to fit your workflow. Nesting depth, folder count and file capacity are enforced per your active plan." },
  { num: "04", Icon: Upload, title: "Upload with confidence", desc: "Drag & drop images, videos, audio and PDFs. Every upload is checked for type, size and quota before it reaches storage." },
  { num: "05", Icon: Sliders, title: "Manage & organize", desc: "Rename, move, download or delete files. Track your usage in real time with a live drive dashboard." },
  { num: "06", Icon: Rocket, title: "Scale as you grow", desc: "Outgrew your plan? Upgrade in one click. Your existing folders and files stay in place — only your limits change." },
];

const useCases = [
  { Icon: Camera, title: "Photographers", desc: "Ship galleries with client-safe folder structures and format-locked policies." },
  { Icon: Video, title: "Video teams", desc: "Enforce per-file size limits and reserve heavier tiers for finished master files." },
  { Icon: Music, title: "Audio creators", desc: "Keep raw stems, samples, and mixdowns compartmentalised — with plan-based caps." },
  { Icon: Briefcase, title: "Small agencies", desc: "One workspace per client, one plan per workspace. Predictable storage costs." },
  { Icon: FileText, title: "PDF-heavy teams", desc: "Legal, HR, or accounting stacks that need auditable folder discipline." },
  { Icon: Users, title: "Freelancers", desc: "Grow from free tier to Diamond as your workload scales — pay only for what you use." },
];

const testimonials = [
  {
    quote: "The subscription model actually enforces itself. That alone put FileCloud ahead of every 'unlimited-then-throttled' service we tested.",
    name: "Ayesha Khan",
    role: "Operations Lead, Studio Nine",
    initial: "A",
  },
  {
    quote: "We spent months building custom quota logic in-house. FileCloud shipped it in a way that feels effortless — with a real admin panel.",
    name: "Daniel Osei",
    role: "CTO, Loomstack",
    initial: "D",
  },
  {
    quote: "Clean UI, honest limits, transparent Stripe billing. Exactly what a small team needs to look big.",
    name: "Priya Rao",
    role: "Founder, Rao & Co",
    initial: "P",
  },
];

const stats = [
  { value: "100%", label: "Backend-enforced" },
  { value: "4+", label: "File formats" },
  { value: "24/7", label: "Availability" },
  { value: "< 1s", label: "Upload validation" },
];

const faqs = [
  {
    q: "Can I switch between plans anytime?",
    a: "Yes. Upgrades take effect immediately and your new limits are applied on the next request. Downgrades apply at the end of your current billing cycle so you never lose files mid-month.",
  },
  {
    q: "What happens if I exceed my plan's limits?",
    a: "Actions that would exceed your quota — like creating a 51st folder on the Silver plan — are rejected by the backend with a clear error. Your existing files are never deleted; you simply need to upgrade to add more.",
  },
  {
    q: "Which file types does FileCloud support?",
    a: "Free covers images. Silver adds PDFs. Gold unlocks video. Diamond includes audio. Every file's MIME type and size is checked server-side before it's saved to Cloudinary.",
  },
  {
    q: "How is billing handled?",
    a: "All paid plans are billed monthly through Stripe. You can view invoices, update your card, or cancel your subscription anytime from the Subscriptions page.",
  },
  {
    q: "Do I need to verify my email?",
    a: "Yes. Every new account receives a 6-digit OTP by email. You cannot upload any file until your account is verified — this keeps the platform clean for everyone.",
  },
  {
    q: "Where are my files stored?",
    a: "All uploads go directly to Cloudinary, which handles encrypted storage, global CDN delivery, and automatic media optimisation. FileCloud only stores metadata and enforces access rules.",
  },
];

function FaqItem({ q, a, i }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <div
      className="fc-card overflow-hidden"
      style={{ borderRadius: 16 }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left px-6 py-5 hover:fc-surface-2 transition-colors"
        data-testid={`faq-toggle-${i}`}
      >
        <span className="text-[15px] font-bold fc-text pr-4">{q}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform"
          style={{
            background: open ? "var(--accent)" : "var(--bg-surface-2)",
            color: open ? "#fff" : "var(--text-secondary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown size={15} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 -mt-1">
          <p className="text-sm fc-text-tertiary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    if (!BASE) { setPlansLoading(false); return; }
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
          style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 55%)", opacity: 0.14 }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="flex flex-col items-center text-center gap-7 max-w-4xl mx-auto fc-anim-fadeUp">
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
              <Link
                href="/features"
                data-testid="hero-features-cta"
                className="fc-btn-ghost h-12 px-7 rounded-2xl text-sm font-bold inline-flex items-center gap-2"
              >
                Explore features
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 flex-wrap justify-center">
              {[
                { Icon: ShieldCheck, label: "Backend-enforced quotas" },
                { Icon: Layers, label: "Unlimited nesting" },
                { Icon: Zap, label: "Instant activation" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs fc-text-tertiary">
                  <Icon size={14} className="fc-accent" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block absolute top-24 right-8 opacity-20 pointer-events-none fc-anim-float">
            <LogoMark size={140} />
          </div>
        </div>
      </section>

      {/* ── LOGO STRIP / STATS ───────────────────────────────────── */}
      <section
        className="py-10 border-y"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight leading-none"
                style={{ letterSpacing: "-0.03em" }}
              >
                {s.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-widest fc-text-muted mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Capabilities</p>
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
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="fc-card p-6 group"
                data-testid={`feature-card-${i}`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold fc-text mb-2">{title}</h3>
                <p className="text-[13px] fc-text-tertiary leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-bold fc-accent hover:underline"
            >
              See the full plan-by-plan feature breakdown
              <ArrowRight size={14} />
            </Link>
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
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Workflow</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Six steps from signup to structured drive.
            </h2>
            <p className="text-base fc-text-tertiary mt-4 leading-relaxed">
              Get from zero to a fully organised, quota-enforced workspace in
              minutes — not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (i % 3) * 0.08 }}
                className="fc-card p-7 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-4xl font-black fc-gradient-text leading-none"
                    style={{ letterSpacing: "-0.05em" }}
                  >
                    {step.num}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <step.Icon size={18} />
                  </div>
                </div>
                <h4 className="text-base font-bold fc-text mb-2">{step.title}</h4>
                <p className="text-[13px] fc-text-tertiary leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────────────────────────── */}
      <section className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Who it's for</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Built for teams who value structure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className="fc-card p-6 flex gap-4 items-start"
                data-testid={`usecase-${i}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold fc-text mb-1">{title}</h3>
                  <p className="text-[13px] fc-text-tertiary leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-24 md:py-28 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="absolute inset-0 fc-dot-bg opacity-50 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Pricing</p>
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
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center fc-text-muted py-16 text-sm">
              No plans available at the moment.
            </p>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {plans.map((plan, i) => {
                const isPopular = plan.id === popularId;
                const types = Array.isArray(plan.allowedTypes) ? plan.allowedTypes : [];

                const rows = [
                  { text: `${plan.maxFolders} max folders`, ok: true },
                  { text: `${plan.maxNesting} nesting levels`, ok: true },
                  { text: `${plan.maxFileSizeMB} MB per file`, ok: true },
                  { text: `${plan.totalFileLimit} total files`, ok: true },
                  { text: `${plan.filesPerFolder} files per folder`, ok: true },
                  {
                    text: types.length
                      ? types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
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
                    style={isPopular ? { background: "var(--bg-inverse)", border: "1px solid var(--accent)" } : {}}
                    data-testid={`pricing-plan-${plan.name?.toLowerCase()}`}
                  >
                    {isPopular && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em] shadow-lg"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        Recommended
                      </span>
                    )}

                    <div className="mb-6">
                      <h3
                        className="text-base font-bold uppercase tracking-widest mb-3"
                        style={{ color: isPopular ? "var(--text-inverse)" : "var(--text-tertiary)" }}
                      >
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-5xl font-extrabold tracking-tight"
                          style={{
                            color: isPopular ? "var(--text-inverse)" : "var(--text-primary)",
                            letterSpacing: "-0.035em",
                          }}
                        >
                          ${plan.priceMonthly ?? 0}
                        </span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: isPopular ? "rgba(255,255,255,0.55)" : "var(--text-muted)" }}
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
                              ? isPopular ? "rgba(255,255,255,0.35)" : "var(--text-muted)"
                              : isPopular ? "rgba(255,255,255,0.9)" : "var(--text-secondary)",
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: f.ok
                                ? isPopular ? "var(--accent)" : "var(--accent-soft)"
                                : "transparent",
                              color: f.ok
                                ? isPopular ? "white" : "var(--accent)"
                                : "var(--text-muted)",
                              border: !f.ok ? "1px solid currentColor" : "none",
                            }}
                          >
                            {f.ok ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                          </span>
                          <span className={!f.ok ? "line-through" : ""}>{f.text}</span>
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

          <div className="mt-14 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-sm font-bold fc-accent hover:underline"
            >
              Compare all plan features side-by-side
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">Loved by teams</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              What our early users say.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
                className="fc-card p-7 flex flex-col"
                data-testid={`testimonial-${i}`}
              >
                <Quote size={22} className="fc-accent mb-4" />
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={13} className="fc-accent" fill="currentColor" />
                  ))}
                </div>
                <p className="text-[14px] fc-text leading-relaxed mb-6 flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold fc-text leading-tight">{t.name}</p>
                    <p className="text-[11px] fc-text-muted mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-28 relative overflow-hidden"
        style={{ background: "var(--bg-surface)" }}
      >
        <div className="absolute inset-0 fc-grid-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 md:px-10">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">FAQ</p>
            <h2
              className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Questions people usually ask.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} i={i} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm fc-text-tertiary">
              Still have questions?{" "}
              <Link href="/contact" className="fc-accent font-bold hover:underline">
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────────────── */}
      <section className="pb-24 pt-16">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div
            className="rounded-3xl p-10 md:p-14 relative overflow-hidden fc-noise"
            style={{ background: "var(--bg-inverse)", border: "1px solid var(--border-strong)" }}
          >
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ background: "var(--accent)" }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3
                  className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
                  style={{ color: "var(--text-inverse)", letterSpacing: "-0.02em" }}
                >
                  Ready to bring structure to your storage?
                </h3>
                <p className="text-sm md:text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
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
