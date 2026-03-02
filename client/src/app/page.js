"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  FolderOpen,
  Shield,
  Database,
  Settings,
  Check,
  X,
  LockKeyhole,
  Loader2,
  Github,
  Globe,
  Linkedin,
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export default function LandingPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/user/all-subscriptions`)
      .then((r) => r.json())
      .then((d) => setPlans(d.data || []))
      .catch(console.error)
      .finally(() => setPlansLoading(false));
  }, []);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How it Works", id: "how-it-works" },
    { label: "Pricing", id: "pricing" },
    { label: "Contact", id: "contact" },
  ];

  // Mark second-most-expensive plan as "popular"
  const popularId = (() => {
    const paid = [...plans]
      .filter((p) => (p.priceMonthly ?? 0) > 0)
      .sort((a, b) => b.priceMonthly - a.priceMonthly);
    return paid.length >= 2 ? paid[1].id : paid[0]?.id ?? null;
  })();

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 min-h-screen font-sans">
      {/* ── Navbar ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 text-lg font-semibold tracking-tight">
              FileCloud
            </span>
          </motion.div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                {link.label}
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (window.location.href = "/login")}
              className="hidden sm:flex items-center justify-center h-9 px-4 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Log In
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (window.location.href = "/register")}
              className="flex items-center justify-center h-9 px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition cursor-pointer"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        {/* Premium Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.25]" />

          <motion.div
            className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-indigo-400 rounded-full blur-3xl opacity-20"
            animate={{ scale: [1, 1.1, 1], x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute -bottom-32 -right-20 w-[420px] h-[420px] bg-purple-400 rounded-full blur-3xl opacity-20"
            animate={{ scale: [1, 1.15, 1], x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-7 py-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeInUp}
            className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 font-semibold text-sm uppercase tracking-wider rounded-full border border-indigo-100"
          >
            Subscription Cloud Storage
          </motion.span>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1] tracking-tight"
          >
            Reliable Storage
            <span className="block mt-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              That Grows With You
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Secure, flexible subscription plans designed for freelancers,
            creators, startups and growing teams who need scalable storage.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (window.location.href = "/register")}
              className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-500 transition cursor-pointer"
            >
              Get Started
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("features")}
              className="px-8 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold text-base hover:bg-gray-50 transition cursor-pointer"
            >
              See Features
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white py-24" id="features">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            className="flex flex-col items-center text-center gap-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-gray-900 text-4xl font-black">
              Enterprise-Grade Control
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              Powerful tools to manage your organizational data hierarchy and
              enforce strict access rules across every department.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                Icon: FolderOpen,
                title: "Deep Folder Nesting",
                desc: "Organize data with unlimited depth and structural clarity. No artificial limitations on hierarchy.",
              },
              {
                Icon: LockKeyhole,
                title: "Smart File Restrictions",
                desc: "Set granular permissions at every level. Block specific file types or sensitive data instantly.",
              },
              {
                Icon: Database,
                title: "Dynamic Storage Quotas",
                desc: "Scale storage automatically based on user subscription tiers. Never overpay for unused space.",
              },
              {
                Icon: Settings,
                title: "Admin-Defined Rules",
                desc: "Enforce corporate compliance with custom automated logic and real-time monitoring.",
              },
            ].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="flex flex-col gap-4 p-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-indigo-600 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section
        className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30"
        id="how-it-works"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.h2
            className="text-gray-900 text-4xl font-black mb-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Simple 3-Step Setup
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200" />
            {[
              {
                step: 1,
                title: "Create Your Account",
                desc: "Sign up in seconds and choose a subscription plan that fits your storage needs.",
              },
              {
                step: 2,
                title: "Upload & Organize",
                desc: "Upload files into folders and manage everything with a clean structured system.",
              },
              {
                step: 3,
                title: "Access Anywhere",
                desc: "Securely access, manage, and share your files from any device anytime.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center gap-4 bg-white p-8 rounded-2xl shadow-lg relative z-10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl">
                  {item.step}
                </div>
                <h4 className="text-gray-900 text-lg font-bold mt-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── now light background ── */}
      {/* ── Pricing ── */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {/* Heading */}
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-black mb-4 text-gray-900">
              Plans Built for Your Scale
            </h2>
            <p className="text-gray-600 text-lg">
              Simple pricing with no hidden fees. Upgrade as you grow.
            </p>
          </motion.div>

          {/* Loader / Empty State */}
          {plansLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600/60" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No plans available at the moment.
            </p>
          ) : (
            // Centered Grid Container
            <div className="flex justify-center items-center px-4">
              <motion.div
                className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 w-full justify-center"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {plans.map((plan) => {
                  const isPopular = plan.id === popularId;
                  const types = Array.isArray(plan.allowedTypes)
                    ? plan.allowedTypes
                    : [];

                  const features = [
                    { text: `${plan.maxFolders} Max Folders`, ok: true },
                    { text: `${plan.maxNesting} Nesting Levels`, ok: true },
                    {
                      text: `${plan.maxFileSizeMB} MB Max File Size`,
                      ok: true,
                    },
                    { text: `${plan.totalFileLimit} Total Files`, ok: true },
                    {
                      text: `${plan.filesPerFolder} Files per Folder`,
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
                      variants={fadeInUp}
                      whileHover={{ y: -12, scale: 1.03 }}
                      className={`relative p-4 md:p-5 rounded-3xl flex flex-col transition-all cursor-pointer w-full md:w-auto md:min-w-[230px] lg:min-w-[300px] ${
                        isPopular
                          ? "bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600 shadow-2xl ring-4 ring-indigo-400/50 md:scale-[1.08] border-transparent"
                          : "bg-white shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      {isPopular && (
                        <motion.div
                          className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg"
                          initial={{ scale: 0, rotate: -5 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            delay: 0.2,
                          }}
                        >
                          ⭐ Most Popular
                        </motion.div>
                      )}

                      <div className="mb-4 md:mb-5">
                        <h3
                          className={`text-xl md:text-2xl font-bold mb-1 md:mb-2 ${
                            isPopular ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {plan.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-4xl md:text-5xl font-black ${
                              isPopular ? "text-white" : "text-gray-900"
                            }`}
                          >
                            ${plan.priceMonthly ?? 0}
                          </span>
                          <span
                            className={`text-base md:text-lg ${
                              isPopular ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            /month
                          </span>
                        </div>
                      </div>

                      <ul className="flex flex-col gap-2 md:gap-2.5 mb-5 md:mb-6 text-sm flex-grow">
                        {features.map((f, fi) => (
                          <li key={fi} className="flex items-start gap-2.5">
                            {f.ok ? (
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isPopular ? "bg-white/20" : "bg-green-100"
                                }`}
                              >
                                <Check
                                  className={`w-3 h-3 ${
                                    isPopular ? "text-white" : "text-green-600"
                                  }`}
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                  isPopular ? "bg-white/10" : "bg-gray-100"
                                }`}
                              >
                                <X
                                  className={`w-3 h-3 ${
                                    isPopular
                                      ? "text-white/50"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                            )}
                            <span
                              className={`leading-relaxed ${
                                !f.ok
                                  ? isPopular
                                    ? "text-white/50 line-through"
                                    : "text-gray-400 line-through"
                                  : isPopular
                                  ? "text-white/95"
                                  : "text-gray-700"
                              }`}
                            >
                              {f.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => (window.location.href = "/register")}
                        className={`w-full h-11 rounded-xl font-bold transition-all cursor-pointer shadow-lg ${
                          isPopular
                            ? "bg-white text-indigo-700 hover:bg-gray-50 shadow-xl"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {(plan.priceMonthly ?? 0) === 0
                          ? "Get Started Free"
                          : `Choose ${plan.name}`}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── light version ── */}
      <footer className="bg-white border-t border-gray-200 text-gray-700 py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-10">
            {/* Brand */}
            <div className="flex flex-col gap-4 max-w-xs">
              <div className="flex items-center gap-2 text-indigo-600">
                <Cloud className="w-6 h-6" />
                <span className="text-gray-900 text-lg font-black">
                  FileCloud
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Secure, intelligent, and flexible cloud storage for modern
                teams.
              </p>
            </div>

            {/* Nav links */}
            <div>
              <h5 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-5">
                Navigate
              </h5>
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => {
                        window.scrollTo({ top: 0 });
                        setTimeout(() => scrollTo(link.id), 80);
                      }}
                      className="text-sm text-gray-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developer links */}
            <div>
              <h5 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-5">
                Developer
              </h5>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="https://github.com/Sami-Sial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/sami-ullah-b536a8338"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://sami-sial-portfolio.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    Portfolio
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} FileCloud. All rights reserved.
            </p>
            <p className="text-gray-600 text-sms">
              Built by{" "}
              <a
                href="https://sami-sial-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer text-md"
              >
                Sami Ullah
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
