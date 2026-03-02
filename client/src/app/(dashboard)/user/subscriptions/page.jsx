"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Check,
  Star,
  Zap,
  History,
  CreditCard,
  ShieldCheck,
  Calendar,
  Crown,
  Folder,
  Files,
  Layers,
  HardDrive,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  ArrowUpRight,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return localStorage.getItem("token");
  }
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const FORMAT_COLORS = {
  image: { color: "#8b5cf6", Icon: FileImage },
  video: { color: "#0ea5e9", Icon: FileVideo },
  audio: { color: "#f59e0b", Icon: FileAudio },
  pdf: { color: "#f43f5e", Icon: FileText },
};

const PLAN_STYLES = {
  free: {
    accent: "#64748b",
    bg: "from-slate-50 to-slate-100",
    ring: "ring-slate-200",
    crown: "text-slate-400",
  },
  silver: {
    accent: "#0ea5e9",
    bg: "from-sky-50 to-blue-50",
    ring: "ring-sky-200",
    crown: "text-sky-400",
  },
  gold: {
    accent: "#f59e0b",
    bg: "from-amber-50 to-yellow-50",
    ring: "ring-amber-200",
    crown: "text-amber-400",
  },
  diamond: {
    accent: "#8b5cf6",
    bg: "from-violet-50 to-purple-50",
    ring: "ring-violet-200",
    crown: "text-violet-400",
  },
};

function getPlanStyle(name = "") {
  return PLAN_STYLES[name.toLowerCase()] || PLAN_STYLES.free;
}

function Bar({ pct = 0, color = "#5048e5" }) {
  const capped = Math.min(pct, 100);
  const c = pct >= 90 ? "#f43f5e" : pct >= 70 ? "#f59e0b" : color;
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${capped}%`, background: c }}
      />
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  color = "text-[#5048e5]",
  bg = "bg-[#5048e5]/10",
}) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <div
        className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center ${color}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-lg font-black text-slate-900">{label}</h2>
    </div>
  );
}

// ─── Active Plan Hero ─────────────────────────────────────────────────────────

function ActivePlanHero({ sub, plan }) {
  const style = getPlanStyle(plan?.name);

  const details = [
    {
      icon: Folder,
      label: "Max Folders",
      value: plan?.maxFolders,
      unit: "folders",
    },
    {
      icon: Files,
      label: "Total Files",
      value: plan?.totalFileLimit,
      unit: "files",
    },
    {
      icon: Layers,
      label: "Nesting Depth",
      value: plan?.maxNesting,
      unit: "levels",
    },
    {
      icon: HardDrive,
      label: "Max File Size",
      value: plan?.maxFileSizeMB,
      unit: "MB",
    },
    {
      icon: Folder,
      label: "Files per Folder",
      value: plan?.filesPerFolder,
      unit: "files/folder",
    },
  ];

  const startDate = sub?.startDate
    ? new Date(sub.startDate).toLocaleDateString("en", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-3xl bg-gradient-to-br ${style.bg} border ${style.ring} ring-1 overflow-hidden p-6 md:p-8`}
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: style.accent }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ background: style.accent }}
      />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background: `${style.accent}20` }}
            >
              <Crown className={`w-7 h-7 ${style.crown}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-slate-900">
                  {plan?.name} Plan
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Active since{" "}
                <span className="font-semibold text-slate-700">
                  {startDate}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-black text-slate-900">
              ${plan?.priceMonthly ?? 0}
              <span className="text-base font-semibold text-slate-400">
                /mo
              </span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">billed monthly</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {details.map(({ icon: Icon, label, value, unit }) => (
            <div
              key={label}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 border border-white/80 shadow-sm"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 leading-none">
                {value ?? "—"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{unit}</p>
            </div>
          ))}
        </div>

        {/* Allowed types */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">
            Allowed types:
          </span>
          {(plan?.allowedTypes || []).map((t) => {
            const cfg = FORMAT_COLORS[t];
            const Icon = cfg?.Icon || FileText;
            return (
              <div
                key={t}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
                style={{
                  background: `${cfg?.color || "#64748b"}15`,
                  color: cfg?.color || "#64748b",
                }}
              >
                <Icon className="w-3 h-3" />
                {t}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, isCurrent, isPopular, onSubscribe, loading }) {
  const style = getPlanStyle(plan.name);

  const features = [
    { label: `${plan.maxFolders} Folders`, icon: Folder },
    { label: `${plan.maxFileSizeMB} MB max file`, icon: HardDrive },
    { label: `${plan.totalFileLimit} total files`, icon: Files },
    { label: `${plan.maxNesting} nesting levels`, icon: Layers },
    { label: `${plan.filesPerFolder} files/folder`, icon: Folder },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isCurrent ? { y: -6, transition: { duration: 0.2 } } : {}}
      className={`relative flex flex-col rounded-3xl bg-white border shadow-sm transition-shadow hover:shadow-lg overflow-hidden ${
        isPopular
          ? "border-[#5048e5] ring-2 ring-[#5048e5]/20"
          : "border-slate-200"
      }`}
    >
      {/* Top accent line */}
      <div
        className="h-1 w-full"
        style={{ background: isCurrent ? "#10b981" : style.accent }}
      />

      {isPopular && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#5048e5] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
          <Star className="w-2.5 h-2.5" fill="currentColor" />
          Popular
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Plan name & price */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${style.accent}15` }}
            >
              <Crown className="w-3.5 h-3.5" style={{ color: style.accent }} />
            </div>
            <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
            {isCurrent && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">
              ${plan.priceMonthly ?? 0}
            </span>
            <span className="text-sm text-slate-400">/mo</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {features.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 text-sm text-slate-600"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              {label}
            </li>
          ))}
          {/* Allowed types */}
          <li className="flex items-start gap-2.5 pt-1">
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="flex flex-wrap gap-1">
              {(plan.allowedTypes || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize"
                  style={{
                    background: `${FORMAT_COLORS[t]?.color || "#64748b"}15`,
                    color: FORMAT_COLORS[t]?.color || "#64748b",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </li>
        </ul>

        {/* CTA */}
        <button
          onClick={() => onSubscribe(plan)}
          disabled={isCurrent || loading}
          className={`w-full py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isCurrent
              ? "bg-emerald-50 text-emerald-600 cursor-default"
              : isPopular
              ? "bg-[#5048e5] text-white hover:bg-[#5048e5]/90 shadow-md shadow-[#5048e5]/20"
              : "bg-slate-900 text-white hover:bg-slate-800"
          } disabled:opacity-60`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCurrent ? (
            <>
              <BadgeCheck className="w-4 h-4" /> Current Plan
            </>
          ) : Number(plan.priceMonthly) > 0 ? (
            <>
              <ArrowUpRight className="w-4 h-4" /> Upgrade — $
              {plan.priceMonthly}/mo
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" /> Get Started Free
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [availablePlans, setAvailablePlans] = useState([]);
  const [userSubs, setUserSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [plansRes, historyRes] = await Promise.all([
        fetch(`${BASE}/api/user/all-subscriptions`),
        fetch(`${BASE}/api/user/my-subscriptions`, { headers }),
      ]);
      const [plansData, historyData] = await Promise.all([
        plansRes.json(),
        historyRes.json(),
      ]);
      setAvailablePlans(plansData.data || []);
      setUserSubs(
        Array.isArray(historyData.data)
          ? historyData.data
          : [historyData.data].filter(Boolean)
      );
    } catch {
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeSub = userSubs.find((s) => s.status === "active");
  const activePlan = activeSub?.subscription;

  const handleSubscribe = async (plan) => {
    setActionLoading(plan.id);
    try {
      const isPaid = Number(plan.priceMonthly) > 0;
      const endpoint = isPaid ? "/api/stripe/payment" : "/api/user/subscribe";
      const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ subscriptionId: plan.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      if (isPaid && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        toast.success(`${plan.name} plan activated!`);
        setRefreshing(true);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#5048e5]" />
          <p className="text-slate-400 text-sm">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-[#5048e5]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#5048e5]">
                  Billing
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Plans & Billing
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage your subscription and explore available plans
              </p>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* ── Active Plan Hero ── */}
          {activePlan && activeSub ? (
            <section>
              <SectionLabel
                icon={Crown}
                label="Your Active Plan"
                color="text-amber-500"
                bg="bg-amber-50"
              />
              <ActivePlanHero sub={activeSub} plan={activePlan} />
            </section>
          ) : (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                You don't have an active plan yet. Choose one below to get
                started.
              </p>
            </div>
          )}

          {/* ── Available Plans ── */}
          <section>
            <SectionLabel icon={ShieldCheck} label="Available Plans" />
            <div
              className={`grid gap-5 ${
                availablePlans.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
                  : availablePlans.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {availablePlans.map((plan, i) => {
                const isCurrent =
                  activeSub?.subscriptionId === plan.id ||
                  activeSub?.subscription?.id === plan.id;
                const isPopular = plan.name?.toLowerCase() === "gold";
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <PlanCard
                      plan={plan}
                      isCurrent={isCurrent}
                      isPopular={isPopular}
                      onSubscribe={handleSubscribe}
                      loading={actionLoading === plan.id}
                    />
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── Billing History ── */}
          <section>
            <SectionLabel
              icon={History}
              label="Billing History"
              color="text-violet-500"
              bg="bg-violet-50"
            />
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {userSubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <History className="w-10 h-10 mb-3 text-slate-200" />
                  <p className="text-sm font-semibold">
                    No billing history yet
                  </p>
                  <p className="text-xs mt-1">
                    Your subscription history will appear here
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Plan", "Started", "Status", "Amount"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userSubs.map((sub, i) => {
                      const ps = getPlanStyle(sub.subscription?.name || "");
                      return (
                        <motion.tr
                          key={sub.id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${ps.accent}15` }}
                              >
                                <Crown
                                  className="w-4 h-4"
                                  style={{ color: ps.accent }}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {sub.subscription?.name || "Plan"}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  ${sub.subscription?.priceMonthly ?? 0}/mo
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {sub.startDate
                                ? new Date(sub.startDate).toLocaleDateString(
                                    "en",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}
                            </div>
                            {sub.endDate && (
                              <p className="text-[11px] text-slate-400 mt-0.5 ml-5">
                                Ended{" "}
                                {new Date(sub.endDate).toLocaleDateString(
                                  "en",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                sub.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : sub.status === "expired"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-amber-100 text-amber-600"
                              }`}
                            >
                              {sub.status === "active" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-black text-slate-900">
                              ${sub.subscription?.priceMonthly ?? "0"}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
