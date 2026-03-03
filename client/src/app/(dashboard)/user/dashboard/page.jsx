"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Folder,
  FolderOpen,
  Files,
  Crown,
  HardDrive,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Layers,
  Zap,
  Activity,
  Cloud,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Shield,
  Globe,
  Lock,
  Hash,
  Calendar,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return localStorage.getItem("token");
  }
}
const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const C = {
  indigo: "#5048e5",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#64748b",
};

const FORMAT_CFG = {
  image: { label: "Images", color: C.violet, Icon: FileImage },
  video: { label: "Videos", color: C.sky, Icon: FileVideo },
  audio: { label: "Audio", color: C.amber, Icon: FileAudio },
  pdf: { label: "PDFs", color: C.rose, Icon: FileText },
};

const PLAN_ACCENT = {
  free: C.slate,
  silver: C.sky,
  gold: C.amber,
  diamond: C.violet,
};

// ─── Compute stats from folders tree ─────────────────────────────────────────

function computeStats(folders) {
  let totalFolders = 0,
    maxNesting = 0,
    totalFiles = 0,
    totalSizeMB = 0;
  const fmt = { image: 0, video: 0, audio: 0, pdf: 0 };
  const nestDist = {};
  const allFiles = [];

  const walk = (list) => {
    for (const f of list) {
      totalFolders++;
      if (f.level > maxNesting) maxNesting = f.level;
      nestDist[f.level] = (nestDist[f.level] || 0) + 1;

      for (const file of f.files || []) {
        totalFiles++;
        totalSizeMB += file.sizeMB || 0;
        if (fmt[file.format] !== undefined) fmt[file.format]++;
        allFiles.push({ ...file, folderName: f.name });
      }
      if (f.subfolders?.length) walk(f.subfolders);
    }
  };
  walk(folders);

  const nestingData = Array.from({ length: maxNesting + 1 }, (_, i) => ({
    level: `L${i}`,
    folders: nestDist[i] || 0,
  }));

  const pieData = Object.entries(fmt)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: FORMAT_CFG[k].label,
      value: v,
      color: FORMAT_CFG[k].color,
      key: k,
    }));

  const now = new Date();
  const dayMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayMap[key] = { files: 0, sizeMB: 0 };
  }

  for (const file of allFiles) {
    if (!file.createdAt) continue;
    const key = new Date(file.createdAt).toISOString().slice(0, 10);
    if (dayMap[key] !== undefined) {
      dayMap[key].files++;
      dayMap[key].sizeMB = parseFloat(
        (dayMap[key].sizeMB + (file.sizeMB || 0)).toFixed(2)
      );
    }
  }

  const activityData = Object.entries(dayMap).map(([dateStr, vals]) => {
    const d = new Date(dateStr);
    return {
      day: d.toLocaleDateString("en", { weekday: "short" }),
      date: dateStr,
      files: vals.files,
      sizeMB: vals.sizeMB,
    };
  });

  const recent = [...allFiles]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 10);

  return {
    totalFolders,
    maxNesting,
    totalFiles,
    totalSizeMB,
    fmt,
    nestingData,
    pieData,
    activityData,
    recent,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMB(mb) {
  if (!mb) return "0 MB";
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProgressBar({ pct = 0, color }) {
  const capped = Math.min(pct, 100);
  const c = pct >= 90 ? C.rose : pct >= 70 ? C.amber : color;
  return (
    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${capped}%`, background: c }}
      />
    </div>
  );
}

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
          {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, accent, pct, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-shadow"
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}15`, color: accent }}
        >
          <Icon className="w-4 h-4" />
        </div>
        {pct !== undefined && (
          <span
            className="text-[11px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `${accent}15`, color: accent }}
          >
            {Math.round(pct)}%
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

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-4">
      {children}
    </p>
  );
}

function Card({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`rounded-2xl bg-white border border-slate-200 shadow-sm p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Folder Tree Node ─────────────────────────────────────────────────────────

function FolderNode({ folder, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = folder.subfolders?.length > 0 || folder.files?.length > 0;
  const fileCount = folder.files?.length || 0;
  const subCount = folder.subfolders?.length || 0;

  const depthColors = [C.indigo, C.violet, C.sky, C.emerald, C.amber, C.rose];
  const accent = depthColors[depth % depthColors.length];

  return (
    <div className={depth > 0 ? "ml-4 border-l border-slate-100 pl-3" : ""}>
      <div
        className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-colors"
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {/* Toggle icon */}
        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
          {hasChildren ? (
            open ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )
          ) : (
            <span className="w-1 h-1 rounded-full bg-slate-200 mx-auto" />
          )}
        </div>

        {/* Folder icon */}
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${accent}15` }}
        >
          {open ? (
            <FolderOpen className="w-3.5 h-3.5" style={{ color: accent }} />
          ) : (
            <Folder className="w-3.5 h-3.5" style={{ color: accent }} />
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-semibold text-slate-700 flex-1 truncate">
          {folder.name}
        </span>

        {/* Badges */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {subCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500">
              {subCount} sub
            </span>
          )}
          {fileCount > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: `${accent}15`, color: accent }}
            >
              {fileCount} files
            </span>
          )}
        </div>

        {/* Always-visible file count */}
        {fileCount > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold group-hover:opacity-0 transition-opacity"
            style={{ background: `${accent}15`, color: accent }}
          >
            {fileCount}
          </span>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Files in this folder */}
            {folder.files?.length > 0 && (
              <div className="ml-4 border-l border-slate-100 pl-3">
                {folder.files.map((file, i) => {
                  const cfg = FORMAT_CFG[file.format] || FORMAT_CFG.pdf;
                  return (
                    <div
                      key={file.id || i}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ background: `${cfg.color}15` }}
                      >
                        <cfg.Icon
                          className="w-3 h-3"
                          style={{ color: cfg.color }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 flex-1 truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {fmtMB(file.sizeMB)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Subfolders */}
            {folder.subfolders?.map((sub, i) => (
              <FolderNode key={sub.id || i} folder={sub} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Folder Explorer Panel ────────────────────────────────────────────────────

function FolderExplorer({
  folders,
  label,
  accent,
  icon: Icon,
  badge,
  emptyMsg,
  delay = 0,
}) {
  const totalFolders = folders?.length || 0;
  const totalFiles =
    folders?.reduce((s, f) => s + (f.files?.length || 0), 0) || 0;

  return (
    <Card delay={delay} className="flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <SectionLabel>{label}</SectionLabel>
        <div className="flex items-center gap-2 -mt-0.5">
          {badge && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${accent}15`, color: accent }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div
        className="flex items-center gap-4 px-3 py-2.5 rounded-xl mb-4"
        style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}15` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="flex items-center gap-5 flex-1">
          <div>
            <p className="text-lg font-black text-slate-900 leading-none">
              {totalFolders}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Folders</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <p className="text-lg font-black text-slate-900 leading-none">
              {totalFiles}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Files</p>
          </div>
        </div>
      </div>

      {/* Tree */}
      {!folders || folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
          <Folder className="w-10 h-10 mb-2" />
          <p className="text-xs font-medium">
            {emptyMsg || "No folders found"}
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto scrollbar-thin space-y-0.5 pr-1">
          {folders.map((folder, i) => (
            <FolderNode key={folder.id || i} folder={folder} depth={0} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // New states for folder explorer sections
  const [allFolders, setAllFolders] = useState([]);
  const [subFolders, setSubFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      const [subRes, folderRes, meRes] = await Promise.all([
        fetch(`${BASE}/api/user/my-subscriptions`, { headers }),
        fetch(`${BASE}/api/user/folders`, { headers }),
        fetch(`${BASE}/api/auth/me`, { headers }),
      ]);
      const [subData, folderData, meData] = await Promise.all([
        subRes.json(),
        folderRes.json(),
        meRes.json(),
      ]);

      const active = (subData.data || []).find((s) => s.status === "active");
      if (active?.subscription) setPlan(active.subscription);

      setStats(computeStats(folderData.data || []));
      if (meData.data) setUser(meData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFolderExplorers = async () => {
    setFoldersLoading(true);
    const headers = { Authorization: `Bearer ${getToken()}` };
    try {
      const [allRes, subRes] = await Promise.all([
        fetch(`${BASE}/api/user/all-folders`, { headers }),
        fetch(`${BASE}/api/user/active-subscription-folders`, { headers }),
      ]);
      const [allData, subData] = await Promise.all([
        allRes.json(),
        subRes.json(),
      ]);
      setAllFolders(allData.data || []);
      setSubFolders(subData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFoldersLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFolderExplorers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5048e5]/10 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-[#5048e5] animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const planAccent = plan
    ? PLAN_ACCENT[plan.name?.toLowerCase()] || C.indigo
    : C.indigo;
  const filePct = plan ? (stats.totalFiles / plan.totalFileLimit) * 100 : 0;
  const folderPct = plan ? (stats.totalFolders / plan.maxFolders) * 100 : 0;
  const nestPct = plan ? (stats.maxNesting / plan.maxNesting) * 100 : 0;

  const gaugeData = [
    { name: "Files", value: Math.round(filePct), fill: C.violet },
    { name: "Folders", value: Math.round(folderPct), fill: C.sky },
    { name: "Nesting", value: Math.round(nestPct), fill: C.emerald },
  ];

  const filesThisWeek = stats?.activityData?.reduce((s, d) => s + d.files, 0);
  const sizeThisWeek = stats?.activityData?.reduce((s, d) => s + d.sizeMB, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.name ? (
                <>
                  Welcome back,{" "}
                  <span style={{ color: planAccent }}>
                    {user.name.split(" ")[0]}
                  </span>{" "}
                  👋
                </>
              ) : (
                "Dashboard"
              )}
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

          <div className="flex items-center gap-3">
            {plan && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold"
                style={{
                  borderColor: `${planAccent}40`,
                  color: planAccent,
                  background: `${planAccent}10`,
                }}
              >
                <Crown className="w-3.5 h-3.5" />
                {plan.name} Plan
              </div>
            )}
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
                fetchFolderExplorers();
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
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Files"
            value={stats.totalFiles}
            sub={`of ${plan?.totalFileLimit ?? "∞"} allowed`}
            icon={Files}
            accent={C.violet}
            pct={filePct}
            delay={0.05}
          />
          <StatCard
            title="Total Folders"
            value={stats.totalFolders}
            sub={`of ${plan?.maxFolders ?? "∞"} allowed`}
            icon={Folder}
            accent={C.sky}
            pct={folderPct}
            delay={0.1}
          />
          <StatCard
            title="Storage Used"
            value={fmtMB(stats.totalSizeMB)}
            sub={`${plan?.maxFileSizeMB ?? "—"} MB max per file`}
            icon={HardDrive}
            accent={C.emerald}
            delay={0.15}
          />
          <StatCard
            title="Deepest Level"
            value={`Level ${stats.maxNesting}`}
            sub={`${Math.max(
              0,
              (plan?.maxNesting ?? 0) - stats.maxNesting - 1
            )} levels remaining`}
            icon={Layers}
            accent={C.amber}
            pct={nestPct}
            delay={0.2}
          />
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <Card delay={0.25} className="lg:col-span-2">
            <div className="flex items-start justify-between mb-1">
              <SectionLabel>Upload Activity — Last 7 Days</SectionLabel>
              <div className="flex items-center gap-4 -mt-0.5">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-700">
                    {filesThisWeek}{" "}
                    <span className="font-medium text-slate-400">files</span>
                  </p>
                  <p className="text-[10px] text-slate-400">this week</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-700">
                    {fmtMB(sizeThisWeek)}
                  </p>
                  <p className="text-[10px] text-slate-400">uploaded</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={stats.activityData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gFiles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.violet} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.sky} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.sky} stopOpacity={0} />
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
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="files"
                  name="Files"
                  stroke={C.violet}
                  strokeWidth={2}
                  fill="url(#gFiles)"
                  dot={{ fill: C.violet, r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="sizeMB"
                  name="Size (MB)"
                  stroke={C.sky}
                  strokeWidth={2}
                  fill="url(#gSize)"
                  dot={{ fill: C.sky, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              {[
                { color: C.violet, label: "Files" },
                { color: C.sky, label: "Size (MB)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: l.color }}
                  />
                  <span className="text-[11px] text-slate-400 font-medium">
                    {l.label}
                  </span>
                </div>
              ))}
              {filesThisWeek === 0 && (
                <span className="text-[11px] text-slate-400 ml-auto">
                  No uploads this week
                </span>
              )}
            </div>
          </Card>

          {/* Radial quota gauges */}
          <Card delay={0.3} className="flex flex-col">
            <SectionLabel>Quota Usage</SectionLabel>
            {!plan ? (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-300">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">No active plan</p>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="28%"
                      outerRadius="90%"
                      data={gaugeData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={6}
                        background={{ fill: "#f1f5f9" }}
                      />
                      <Tooltip content={<ChartTip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5 mt-1">
                  {gaugeData.map((g) => (
                    <div
                      key={g.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: g.fill }}
                        />
                        <span className="text-xs text-slate-500 font-medium">
                          {g.name}
                        </span>
                      </div>
                      <span
                        className="text-xs font-black"
                        style={{ color: g.fill }}
                      >
                        {g.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Donut pie */}
          <Card delay={0.35}>
            <SectionLabel>File Type Distribution</SectionLabel>
            {stats.totalFiles === 0 ? (
              <div className="flex flex-col items-center justify-center h-[180px] text-slate-300">
                <Activity className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">No files yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {stats.pieData.map((d) => (
                    <div key={d.key} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: d.color }}
                      />
                      <span className="text-[11px] text-slate-500 truncate">
                        {d.name}
                      </span>
                      <span className="text-[11px] font-black text-slate-700 ml-auto">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  {stats.pieData.map((d) => (
                    <div key={d.key}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400">
                          {d.name}
                        </span>
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: d.color }}
                        >
                          {Math.round((d.value / stats.totalFiles) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(d.value / stats.totalFiles) * 100}%`,
                            background: d.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Nesting bar chart */}
          <Card delay={0.4}>
            <div className="flex items-start justify-between mb-1">
              <SectionLabel>Folder Depth Distribution</SectionLabel>
              {stats.totalFolders > 0 && (
                <span className="text-[10px] text-slate-400 -mt-0.5">
                  {stats.totalFolders} total
                </span>
              )}
            </div>
            {stats.nestingData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-300">
                <Folder className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">No folders yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={stats.nestingData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="level"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTip />}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar dataKey="folders" name="Folders" radius={[6, 6, 0, 0]}>
                      {stats.nestingData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            [
                              C.indigo,
                              C.violet,
                              C.sky,
                              C.emerald,
                              C.amber,
                              C.rose,
                            ][i % 6]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                  {stats.nestingData.map((d) => (
                    <div key={d.level} className="text-center">
                      <p className="text-sm font-black text-slate-900">
                        {d.folders}
                      </p>
                      <p className="text-[10px] text-slate-400">{d.level}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Plan details */}
          <Card delay={0.45} className="flex flex-col">
            <SectionLabel>Your Plan</SectionLabel>
            {plan ? (
              <div className="flex flex-col gap-3 flex-1">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: `${planAccent}0f`,
                    border: `1px solid ${planAccent}30`,
                  }}
                >
                  <Crown
                    className="w-5 h-5 shrink-0"
                    style={{ color: planAccent }}
                  />
                  <div>
                    <p
                      className="text-sm font-black"
                      style={{ color: planAccent }}
                    >
                      {plan.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      ${plan.priceMonthly ?? 0}/month
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </div>
                </div>

                {[
                  {
                    label: "Max Folders",
                    value: plan.maxFolders,
                    used: stats.totalFolders,
                    color: C.sky,
                  },
                  {
                    label: "Total Files",
                    value: plan.totalFileLimit,
                    used: stats.totalFiles,
                    color: C.violet,
                  },
                  {
                    label: "Nesting Levels",
                    value: plan.maxNesting,
                    used: stats.maxNesting,
                    color: C.emerald,
                  },
                ].map((row) => {
                  const pct = Math.min((row.used / row.value) * 100, 100);
                  const c =
                    pct >= 90 ? C.rose : pct >= 70 ? C.amber : row.color;
                  return (
                    <div key={row.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {row.label}
                        </span>
                        <span className="text-[11px] font-black text-slate-600">
                          {row.used} / {row.value}
                        </span>
                      </div>
                      <ProgressBar pct={pct} color={c} />
                    </div>
                  );
                })}

                <div className="mt-1 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Files per folder
                    </span>
                    <span className="text-[11px] font-black text-slate-600">
                      {plan.filesPerFolder} max
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Max file size
                    </span>
                    <span className="text-[11px] font-black text-slate-600">
                      {plan.maxFileSizeMB} MB
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(plan.allowedTypes || []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                        style={{
                          background: `${FORMAT_CFG[t]?.color || C.slate}15`,
                          color: FORMAT_CFG[t]?.color || C.slate,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-300">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-xs font-medium">No active plan</p>
              </div>
            )}
          </Card>
        </div>

        {/* ── Folder Explorers ── */}
        {foldersLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 h-64 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <Cloud className="w-7 h-7 animate-pulse" />
                  <p className="text-xs font-medium">Loading folders...</p>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* All Folders */}
            <FolderExplorer
              folders={allFolders}
              label="All Folders"
              accent={C.indigo}
              icon={Globe}
              badge={`${allFolders.length} root`}
              emptyMsg="No folders found"
              delay={0.5}
            />

            {/* Active Subscription Folders */}
            <FolderExplorer
              folders={subFolders}
              label="Active Subscription Folders"
              accent={C.emerald}
              icon={Shield}
              badge={plan ? plan.name : "Subscription"}
              emptyMsg="No subscription folders"
              delay={0.55}
            />
          </div>
        )}

        {/* ── Recent Files ── */}
        {stats.recent.length > 0 && (
          <Card delay={0.6}>
            <div className="flex items-center justify-between mb-4">
              <SectionLabel>Recent Files</SectionLabel>
              <span className="text-[11px] text-slate-400 font-medium -mt-4">
                {stats.recent.length} files
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {stats.recent.map((file, i) => {
                const cfg = FORMAT_CFG[file.format] || FORMAT_CFG.pdf;
                return (
                  <motion.div
                    key={file.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.03 }}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}15` }}
                    >
                      <cfg.Icon
                        className="w-3.5 h-3.5"
                        style={{ color: cfg.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {file.folderName}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
