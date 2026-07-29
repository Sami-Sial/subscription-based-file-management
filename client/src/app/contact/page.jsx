"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Loader2,
  Github,
  Linkedin,
  Globe,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const contactChannels = [
  {
    Icon: Mail,
    label: "Email",
    value: "hello@filecloud.dev",
    href: "mailto:hello@filecloud.dev",
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

const socials = [
  { Icon: Github, href: "https://github.com/Sami-Sial", label: "GitHub" },
  { Icon: Linkedin, href: "https://www.linkedin.com/in/sami-ullah-b536a8338", label: "LinkedIn" },
  { Icon: Globe, href: "https://sami-sial-portfolio.vercel.app", label: "Portfolio" },
];

const reasons = [
  { title: "General inquiry", desc: "Questions about the product, pricing, or how something works." },
  { title: "Sales & upgrades", desc: "Interested in a higher plan or need a custom quota configuration." },
  { title: "Technical support", desc: "Something isn't working the way you expected — we'll dig in." },
  { title: "Partnership", desc: "You'd like to integrate, resell, or collaborate on FileCloud." },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please tell us your name";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email";
    if (!form.message.trim()) e.message = "Please share a message";
    else if (form.message.trim().length < 10)
      e.message = "Message needs at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSending(true);
    // Frontend-only contact submission: simulate a send + mail fallback.
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    toast.success("Thanks! We'll get back to you within 24 hours.");
    // Optional: open user's mail client as a fallback delivery channel
    try {
      const body = encodeURIComponent(
        `Hi FileCloud team,\n\n${form.message}\n\n— ${form.name} (${form.email})\nTopic: ${form.topic}`
      );
      const subject = encodeURIComponent(`[FileCloud] ${form.topic} from ${form.name}`);
      window.location.href = `mailto:hello@filecloud.dev?subject=${subject}&body=${body}`;
    } catch {}
    setForm({ name: "", email: "", topic: "General inquiry", message: "" });
  };

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
            className="text-4xl md:text-6xl font-extrabold fc-text tracking-tight leading-[1.02] mb-5"
            style={{ letterSpacing: "-0.03em" }}
          >
            Let's talk about your <span className="fc-gradient-text">storage.</span>
          </h1>
          <p className="text-base md:text-lg fc-text-tertiary max-w-2xl mx-auto leading-relaxed">
            Questions, feedback, partnerships, or an idea for a feature —
            drop us a line and we'll get back to you within a day.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_1.15fr] gap-8">
          {/* Left column — form */}
          <div className="fc-card p-7 md:p-9 order-2 lg:order-1">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest fc-accent mb-2">
                Send us a message
              </p>
              <h2
                className="text-2xl font-extrabold fc-text tracking-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                We read every submission.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
                    Your name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Alex Doe"
                    disabled={sending}
                    data-testid="contact-name-input"
                    className={`fc-input w-full h-11 px-4 rounded-xl text-sm ${
                      errors.name ? "border-red-400" : ""
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    disabled={sending}
                    data-testid="contact-email-input"
                    className={`fc-input w-full h-11 px-4 rounded-xl text-sm ${
                      errors.email ? "border-red-400" : ""
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
                  Topic
                </label>
                <select
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  disabled={sending}
                  data-testid="contact-topic-select"
                  className="fc-input w-full h-11 px-4 rounded-xl text-sm cursor-pointer"
                >
                  {reasons.map((r) => (
                    <option key={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest fc-text-tertiary">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  disabled={sending}
                  data-testid="contact-message-input"
                  className={`fc-input w-full px-4 py-3 rounded-xl text-sm resize-none ${
                    errors.message ? "border-red-400" : ""
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-500">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                data-testid="contact-submit-btn"
                className="fc-btn-accent w-full h-11 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send message
                  </>
                )}
              </button>

              <p className="text-[11px] fc-text-muted leading-relaxed pt-1">
                By submitting, you agree to our{" "}
                <Link href="/privacy" className="fc-accent font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Right column — info */}
          <div className="order-1 lg:order-2 flex flex-col gap-5">
            <div className="fc-card p-7">
              <p className="text-[11px] font-black uppercase tracking-widest fc-accent mb-4">
                Reach us directly
              </p>
              <div className="flex flex-col gap-4">
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

              <div
                className="mt-6 pt-6 border-t"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest fc-text-muted mb-3">
                  Follow along
                </p>
                <div className="flex items-center gap-2">
                  {socials.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 inline-flex items-center justify-center rounded-xl fc-btn-ghost"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

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
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
