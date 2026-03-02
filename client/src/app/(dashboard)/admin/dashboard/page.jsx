"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Crown,
  Folder,
  Files,
  DollarSign,
  TrendingUp,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  RefreshCw,
  ShieldCheck,
  Activity,
  Calendar,
  Mail,
  Package,
  HardDrive,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Config ───────────────────────────────────────────────────────────────────

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return localStorage.getItem("token");
  }
}

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5000";

const C = {
  indigo: "#5048e5",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#64748b",
  pink: "#ec4899",
};

const FORMAT_CFG = {
  image: { label: "Images", color: C.violet, Icon: FileImage },
  video: { label: "Videos", color: C.sky, Icon: FileVideo },
  audio: { label: "Audio", color: C.amber, Icon: FileAudio },
  pdf: { label: "PDFs", color: C.rose, Icon: FileText },
};

const PLAN_COLORS = {
  free: C.slate,
  silver: C.sky,
  gold: C.amber,
  diamond: C.violet,
};

function planColor(name = "") {
  return PLAN_COLORS[name.toLowerCase()] || C.indigo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMB(mb) {
  if (!mb && mb !== 0) return "—";
  if (mb < 1024) return `${parseFloat(mb).toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function initials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-slate-400 mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p
          key={i}
          style={{ color: p.color || p.fill || C.indigo }}
          className="font-bold"
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, accent, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
            +{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
        {value}
      </p>
      <p className="text-sm font-semibold text-slate-600 mt-1">{title}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
  color = "text-[#5048e5]",
  bg = "bg-[#5048e5]/10",
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div
        className={`w-7 h-7 rounded-xl ${bg} ${color} flex items-center justify-center`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
        {children}
      </h2>
    </div>
  );
}

function Card({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl bg-white border border-slate-200 shadow-sm p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Avatar({ name, color }) {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0"
      style={{ background: color || C.indigo }}
    >
      {initials(name)}
    </div>
  );
}

function PlanBadge({ name }) {
  const c = planColor(name);
  return (
    <span
      className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
      style={{ background: `${c}18`, color: c }}
    >
      {name || "—"}
    </span>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const res = await fetch(`${BASE}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to load stats");
      }

      setData(json.data);

      if (refreshing) {
        toast.success("Dashboard refreshed");
      }
    } catch (err) {
      console.error("Admin stats error:", err);
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5048e5]/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#5048e5] animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-slate-600 text-sm font-semibold">
            Failed to load dashboard
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="px-4 py-2 rounded-xl bg-[#5048e5] text-white text-sm font-semibold hover:bg-[#4039d0] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalUsers,
    totalSubscriptions,
    totalFolders,
    totalFiles,
    activeSubscribersCount,
    mrr,
    totalRevenue,
    planDistribution,
    formatSummary,
    userGrowth,
    revenueGrowth,
    recentUsers,
    recentUserSubs,
  } = data;

  // Total storage used across all files
  const totalSizeMB = formatSummary.reduce((s, f) => s + (f.sizeMB || 0), 0);

  // Pie data for plan distribution
  const planPieData = planDistribution.map((p) => ({
    name: p.name,
    value: p.count,
    color: planColor(p.name),
  }));

  // Format bar data
  const formatBarData = formatSummary.map((f) => ({
    name: FORMAT_CFG[f.format]?.label || f.format,
    count: f.count,
    sizeMB: f.sizeMB,
    color: FORMAT_CFG[f.format]?.color || C.slate,
  }));

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-7">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#5048e5]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#5048e5]">
                  Admin
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("en", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchStats();
              }}
              disabled={refreshing}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </motion.div>

          {/* ── Stat Cards Row 1: Users & Revenue ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={totalUsers}
              sub="registered accounts"
              icon={Users}
              accent={C.indigo}
              delay={0.05}
            />
            <StatCard
              title="Active Subscribers"
              value={activeSubscribersCount}
              sub={`of ${totalUsers} total users`}
              icon={Crown}
              accent={C.amber}
              delay={0.1}
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${mrr.toFixed(2)}`}
              sub="from active subscriptions"
              icon={DollarSign}
              accent={C.emerald}
              delay={0.15}
            />
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              sub="all time"
              icon={TrendingUp}
              accent={C.violet}
              delay={0.2}
            />
          </div>

          {/* ── Stat Cards Row 2: Storage & Content ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Folders"
              value={totalFolders}
              sub="across all users"
              icon={Folder}
              accent={C.sky}
              delay={0.25}
            />
            <StatCard
              title="Total Files"
              value={totalFiles}
              sub="across all users"
              icon={Files}
              accent={C.rose}
              delay={0.3}
            />
            <StatCard
              title="Storage Used"
              value={fmtMB(totalSizeMB)}
              sub="total across platform"
              icon={HardDrive}
              accent={C.pink}
              delay={0.35}
            />
            <StatCard
              title="Subscription Plans"
              value={totalSubscriptions}
              sub="available plans"
              icon={Package}
              accent={C.slate}
              delay={0.4}
            />
          </div>

          {/* ── Charts Row 1: Growth ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User registrations - area chart */}
            <Card delay={0.42}>
              <SectionLabel icon={Users} children="User Growth — Last 7 Days" />
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart
                  data={userGrowth}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.indigo}
                        stopOpacity={0.2}
                      />
                      <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ stroke: "#e2e8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New Users"
                    stroke={C.indigo}
                    strokeWidth={2}
                    fill="url(#gUsers)"
                    dot={{ fill: C.indigo, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Revenue by day - bar chart */}
            <Card delay={0.44}>
              <SectionLabel
                icon={DollarSign}
                children="Revenue — Last 7 Days"
                color="text-emerald-600"
                bg="bg-emerald-50"
              />
              <ResponsiveContainer width="100%" height={190}>
                <BarChart
                  data={revenueGrowth}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue ($)"
                    fill={C.emerald}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* ── Charts Row 2: Distributions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Plan distribution — donut */}
            <Card delay={0.46}>
              <SectionLabel
                icon={Crown}
                children="Plan Distribution"
                color="text-amber-500"
                bg="bg-amber-50"
              />
              {planPieData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[160px] text-slate-300">
                  <Activity className="w-8 h-8 mb-2" />
                  <p className="text-xs">No active subscribers</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={planPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {planPieData.map((e, i) => (
                          <Cell key={i} fill={e.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {planPieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: d.color }}
                          />
                          <span className="text-[11px] text-slate-500 capitalize">
                            {d.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${
                                  (d.value / activeSubscribersCount) * 100
                                }%`,
                                background: d.color,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-slate-700 w-4 text-right">
                            {d.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* File formats — bar chart */}
            <Card delay={0.48} className="lg:col-span-2">
              <SectionLabel
                icon={Files}
                children="File Types Breakdown"
                color="text-violet-500"
                bg="bg-violet-50"
              />
              {formatBarData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[160px] text-slate-300">
                  <Files className="w-8 h-8 mb-2" />
                  <p className="text-xs">No files yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart
                      data={formatBarData}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={<ChartTip />}
                        cursor={{ fill: "#f8fafc" }}
                      />
                      <Bar dataKey="count" name="Files" radius={[6, 6, 0, 0]}>
                        {formatBarData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Format detail tiles */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
                    {formatBarData.map((f) => {
                      const cfg = FORMAT_CFG[f.name.toLowerCase()] || {};
                      const Icon = cfg.Icon || FileText;
                      return (
                        <div
                          key={f.name}
                          className="text-center p-2 rounded-xl"
                          style={{ background: `${f.color}08` }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1"
                            style={{ background: `${f.color}18` }}
                          >
                            <Icon
                              className="w-3.5 h-3.5"
                              style={{ color: f.color }}
                            />
                          </div>
                          <p className="text-sm font-black text-slate-900">
                            {f.count}
                          </p>
                          <p className="text-[10px] text-slate-400">{f.name}</p>
                          <p
                            className="text-[10px] font-medium"
                            style={{ color: f.color }}
                          >
                            {fmtMB(f.sizeMB)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* ── Tables Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Users */}
            <Card delay={0.5}>
              <SectionLabel icon={Users} children="Recent Users" />
              <div className="space-y-1">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No users yet
                  </p>
                ) : (
                  recentUsers.map((user, i) => {
                    const activePlan = user.subscriptions?.[0]?.subscription;
                    const avatarColors = [
                      C.indigo,
                      C.violet,
                      C.sky,
                      C.emerald,
                      C.amber,
                      C.rose,
                      C.pink,
                      C.slate,
                    ];
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <Avatar
                          name={user.name}
                          color={avatarColors[i % avatarColors.length]}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {user.name || "—"}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <p className="text-[10px] text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {activePlan ? (
                            <PlanBadge name={activePlan.name} />
                          ) : (
                            <span className="text-[10px] text-slate-300 font-medium">
                              No plan
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-300" />
                            <span className="text-[10px] text-slate-400">
                              {timeAgo(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Recent Subscriptions */}
            <Card delay={0.52}>
              <SectionLabel
                icon={Crown}
                children="Recent Subscriptions"
                color="text-amber-500"
                bg="bg-amber-50"
              />
              <div className="space-y-1">
                {recentUserSubs.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    No subscriptions yet
                  </p>
                ) : (
                  recentUserSubs.map((sub, i) => {
                    const pc = planColor(sub.subscription?.name);
                    return (
                      <motion.div
                        key={sub.id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.52 + i * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {/* Plan icon */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${pc}18` }}
                        >
                          <Crown
                            className="w-3.5 h-3.5"
                            style={{ color: pc }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {sub.user?.name || "Unknown"}
                            </p>
                            <PlanBadge name={sub.subscription?.name} />
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                            <p className="text-[10px] text-slate-400 truncate">
                              {sub.user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.status === "active"
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-slate-300"
                              }`}
                            />
                            <span
                              className={`text-[10px] font-black ${
                                sub.status === "active"
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-2.5 h-2.5 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-600">
                              ${sub.subscription?.priceMonthly ?? 0}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              · {timeAgo(sub.startDate)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
