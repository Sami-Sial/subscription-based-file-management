import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import Link from "next/link";
import {
  Target,
  Compass,
  Layers,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "About FileCloud — Enterprise-grade file management",
  description: "Learn about FileCloud, our mission, and the team behind the platform.",
};

const values = [
  {
    Icon: ShieldCheck,
    title: "Discipline first",
    desc: "We believe file systems should have real, enforced rules — not vague suggestions.",
  },
  {
    Icon: Layers,
    title: "Structure at scale",
    desc: "Deep folder hierarchies and file policies are treated as first-class citizens.",
  },
  {
    Icon: Zap,
    title: "Fast on the backend",
    desc: "Every quota, every check, every rule — validated server-side before any action.",
  },
  {
    Icon: Users,
    title: "Built for teams",
    desc: "Admins define the guardrails. Users get a clean, capable drive.",
  },
];

const stats = [
  { value: "100%", label: "Backend-enforced rules" },
  { value: "4+", label: "File formats supported" },
  { value: "∞", label: "Nesting depth (per plan)" },
  { value: "24/7", label: "Storage availability" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen fc-canvas">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="absolute inset-0 fc-grid-bg opacity-60 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em] mb-6"
            style={{
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent-ring)",
            }}
          >
            <Compass size={12} /> About us
          </span>
          <h1
            className="font-extrabold fc-text tracking-tight leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.2rem)", letterSpacing: "-0.04em" }}
          >
            We build storage that <span className="fc-gradient-text">respects rules.</span>
          </h1>
          <p className="text-base md:text-lg fc-text-tertiary max-w-2xl mx-auto leading-relaxed">
            FileCloud started with a simple frustration: every file management
            product either had no limits, or had limits that the frontend
            silently ignored. We fixed that. Our subscription rules are enforced
            at the backend for every folder and every file — no exceptions.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Target size={20} />
            </div>
            <h2
              className="text-3xl font-extrabold fc-text tracking-tight mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Our mission
            </h2>
            <p className="text-base fc-text-tertiary leading-relaxed mb-4">
              Give teams a file management platform where subscription tiers
              actually mean something. Where a "Silver" plan enforces its 100
              folder limit, and a "Gold" plan unlocks video uploads — for real,
              at the API level.
            </p>
            <p className="text-base fc-text-tertiary leading-relaxed">
              We think of storage limits as a product feature, not a hidden
              config. Admins should own the rules. Users should trust them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="fc-card p-6">
                <p
                  className="text-4xl font-extrabold fc-text tracking-tight leading-none mb-2"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {s.value}
                </p>
                <p className="text-xs fc-text-tertiary font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">
            What we stand for
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold fc-text tracking-tight mb-12 max-w-xl"
            style={{ letterSpacing: "-0.025em" }}
          >
            Four principles that shape everything.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="fc-card p-7 flex gap-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold fc-text mb-1.5">{title}</h3>
                  <p className="text-[13.5px] fc-text-tertiary leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team card */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] fc-accent mb-3">
              The maker
            </p>
            <h3
              className="text-2xl md:text-3xl font-extrabold fc-text mb-3 tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Crafted by Sami Ullah
            </h3>
            <p className="text-sm fc-text-tertiary max-w-lg mx-auto mb-6 leading-relaxed">
              A full-stack developer obsessed with clean architecture, real
              constraints, and shipping products that behave the way they claim
              to. FileCloud is his take on subscription-aware storage.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://sami-sial-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="fc-btn-ghost h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                View portfolio <ArrowRight size={14} />
              </a>
              <Link
                href="/register"
                className="fc-btn-accent h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
              >
                Try FileCloud <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
