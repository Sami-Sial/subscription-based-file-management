"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  Files,
  Layers,
  HardDrive,
  Crown,
  TrendingUp,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Loader2,
  AlertTriangle,
  Zap,
  Globe,
  Shield,
  ChevronDown,
} from "lucide-react";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return localStorage.getItem("token");
  }
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

// ─── Mini circular progress ring ─────────────────────────────────────────────

function Ring({ pct = 0, size = 44, stroke = 4, color = "#6366f1" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(pct / 100, 1);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ─── Thin horizontal progress bar ────────────────────────────────────────────

function Bar({ pct = 0, color = "bg-indigo-500", bg = "bg-slate-100" }) {
  const capped = Math.min(pct, 100);
  const dangerColor =
    pct >= 90 ? "bg-rose-500" : pct >= 70 ? "bg-amber-500" : null;
  return (
    <div className={`w-full h-1.5 rounded-full ${bg} overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          dangerColor || color
        }`}
        style={{ width: `${capped}%` }}
      />
    </div>
  );
}

// ─── Plan badge styles ────────────────────────────────────────────────────────

const planColors = {
  free: { bg: "bg-slate-100", text: "text-slate-600", ring: "#94a3b8" },
  silver: { bg: "bg-blue-50", text: "text-blue-600", ring: "#3b82f6" },
  gold: { bg: "bg-amber-50", text: "text-amber-600", ring: "#f59e0b" },
  diamond: { bg: "bg-violet-50", text: "text-violet-600", ring: "#8b5cf6" },
};

function getPlanStyle(name = "") {
  return planColors[name.toLowerCase()] || planColors.free;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmtN(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtMB(mb) {
  if (!mb) return "—";
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// ─── Compute deep stats from folders array ────────────────────────────────────

function computeStats(folders) {
  let totalFolders = 0,
    maxNestingUsed = 0,
    totalFiles = 0,
    totalSizeMB = 0;
  const formatCounts = { image: 0, video: 0, audio: 0, pdf: 0 };

  const walk = (list) => {
    for (const f of list) {
      totalFolders++;
      if (f.level > maxNestingUsed) maxNestingUsed = f.level;
      for (const file of f.files || []) {
        totalFiles++;
        totalSizeMB += file.sizeMB || 0;
        if (formatCounts[file.format] !== undefined)
          formatCounts[file.format]++;
      }
      if (f.subfolders?.length) walk(f.subfolders);
    }
  };
  walk(folders);

  return {
    totalFolders,
    maxNestingUsed,
    totalFiles,
    totalSizeMB,
    formatCounts,
  };
}

// ─── Section divider with label ──────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, accent, badge }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
      </div>
      <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </span>
      {badge && (
        <span
          className="text-[10px] font-black px-2 py-0.5 rounded-full ml-1"
          style={{ background: `${accent}15`, color: accent }}
        >
          {badge}
        </span>
      )}
      <div className="flex-1 h-px bg-slate-100 ml-1" />
    </div>
  );
}

// ─── Stat row card (shared layout) ───────────────────────────────────────────

function StatGrid({ stats, plan, accent, showPlan = false }) {
  const planStyle = plan ? getPlanStyle(plan.name) : planColors.free;

  const folderPct = plan?.maxFolders
    ? (stats.totalFolders / plan.maxFolders) * 100
    : 0;
  const filePct = plan?.totalFileLimit
    ? (stats.totalFiles / plan.totalFileLimit) * 100
    : 0;
  const nestPct = plan?.maxNesting
    ? (stats.maxNestingUsed / plan.maxNesting) * 100
    : 0;

  const remainingFiles = plan
    ? Math.max(0, plan.totalFileLimit - stats.totalFiles)
    : null;
  const remainingFolders = plan
    ? Math.max(0, plan.maxFolders - stats.totalFolders)
    : null;
  const remainingNesting = plan
    ? Math.max(0, plan.maxNesting - stats.maxNestingUsed - 1)
    : null;

  const formatIcons = {
    image: {
      icon: FileImage,
      color: "text-violet-500",
      bg: "bg-violet-500",
      label: "Images",
    },
    video: {
      icon: FileVideo,
      color: "text-blue-500",
      bg: "bg-blue-500",
      label: "Videos",
    },
    audio: {
      icon: FileAudio,
      color: "text-amber-500",
      bg: "bg-amber-500",
      label: "Audio",
    },
    pdf: {
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-500",
      label: "PDFs",
    },
  };

  return (
    <div className="space-y-3">
      {/* Top stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Plan / Overview card */}
        {showPlan && plan ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Plan
              </span>
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${planStyle.bg} ${planStyle.text}`}
              >
                {plan.name}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Ring
                  pct={filePct}
                  size={40}
                  stroke={4}
                  color={planStyle.ring}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Crown className={`w-3 h-3 ${planStyle.text}`} />
                </div>
              </div>
              <div>
                <p className="text-base font-black text-slate-900 leading-none">
                  ${plan.priceMonthly ?? 0}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">per month</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                {plan.allowedTypes?.join(", ") || "—"}
              </span>
            </div>
          </div>
        ) : (
          /* No-plan overview — just show storage used */
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Storage
              </span>
              <HardDrive className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-900 leading-none">
              {fmtMB(stats.totalSizeMB)}
            </p>
            <p className="text-[10px] text-slate-400">total used</p>
          </div>
        )}

        {/* Folders */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Folders
            </span>
            <Folder className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <div className="flex items-end justify-between gap-1">
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">
                {fmtN(stats.totalFolders)}
              </p>
              {plan && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  of {fmtN(plan.maxFolders)}
                </p>
              )}
            </div>
            {remainingFolders !== null && (
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500">
                  {fmtN(remainingFolders)}
                </p>
                <p className="text-[10px] text-slate-400">left</p>
              </div>
            )}
          </div>
          {plan && <Bar pct={folderPct} color="bg-indigo-500" />}
        </div>

        {/* Files */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Files
            </span>
            <Files className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
          <div className="flex items-end justify-between gap-1">
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">
                {fmtN(stats.totalFiles)}
              </p>
              {plan && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  of {fmtN(plan.totalFileLimit)}
                </p>
              )}
            </div>
            {remainingFiles !== null && (
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    remainingFiles === 0
                      ? "text-rose-500"
                      : remainingFiles < 10
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {fmtN(remainingFiles)}
                </p>
                <p className="text-[10px] text-slate-400">left</p>
              </div>
            )}
          </div>
          {plan && <Bar pct={filePct} color="bg-violet-500" />}
        </div>

        {/* Nesting */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Nesting
            </span>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-end justify-between gap-1">
            <div>
              <p className="text-xl font-black text-slate-900 leading-none">
                {stats.maxNestingUsed}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">deepest level</p>
            </div>
            {remainingNesting !== null && (
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500">
                  {remainingNesting}
                </p>
                <p className="text-[10px] text-slate-400">levels left</p>
              </div>
            )}
          </div>
          {plan && <Bar pct={nestPct} color="bg-sky-500" />}
        </div>
      </div>

      {/* Bottom row: upload limits + file type breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Upload limits */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Upload Limits
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Max file size</p>
              <p className="text-lg font-black text-slate-900">
                {plan?.maxFileSizeMB ?? "—"}{" "}
                <span className="text-xs font-bold text-slate-400">MB</span>
              </p>
              <p className="text-[10px] text-slate-500">per file</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Per folder</p>
              <p className="text-lg font-black text-slate-900">
                {plan?.filesPerFolder ?? "—"}{" "}
                <span className="text-xs font-bold text-slate-400">files</span>
              </p>
              <p className="text-[10px] text-slate-500">max</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-400">Storage used</span>
                <span className="text-[10px] font-bold text-slate-600">
                  {fmtMB(stats.totalSizeMB)}
                </span>
              </div>
              {remainingFiles !== null && (
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">
                    Can still upload
                  </span>
                  <span
                    className={`text-[10px] font-black ${
                      remainingFiles === 0
                        ? "text-rose-500"
                        : remainingFiles < 10
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {remainingFiles} files
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File type breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              File Types
            </span>
          </div>
          {stats.totalFiles === 0 ? (
            <div className="flex items-center gap-2 py-3 text-slate-300">
              <HardDrive className="w-5 h-5" />
              <p className="text-xs">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(formatIcons).map(
                ([key, { icon: Icon, color, bg, label }]) => {
                  const count = stats.formatCounts[key] || 0;
                  const pct = stats.totalFiles
                    ? (count / stats.totalFiles) * 100
                    : 0;
                  const allowed = plan?.allowedTypes?.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2.5 ${
                        plan && !allowed ? "opacity-40" : ""
                      }`}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-50 shrink-0">
                        <Icon className={`w-3 h-3 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {label}
                          </span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {count}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-1 rounded-full transition-all duration-700 ${bg}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
          {plan?.allowedTypes?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-medium mr-1 leading-5">
                Allowed:
              </span>
              {plan.allowedTypes.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold capitalize"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible section wrapper ─────────────────────────────────────────────

function CollapsibleSection({
  icon,
  label,
  badge,
  accent,
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 mb-3 group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}18` }}
        >
          {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">
          {label}
        </span>
        {badge && (
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full ml-1"
            style={{ background: `${accent}15`, color: accent }}
          >
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-slate-100 ml-1" />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StorageStats() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [allStats, setAllStats] = useState(null);
  const [subStats, setSubStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    Promise.all([
      fetch(`${BASE}/api/user/my-subscriptions`, { headers }).then((r) =>
        r.json()
      ),
      fetch(`${BASE}/api/user/all-folders`, { headers }).then((r) => r.json()),
      fetch(`${BASE}/api/user/active-subscription-folders`, { headers }).then(
        (r) => r.json()
      ),
    ])
      .then(([subData, allFolderData, subFolderData]) => {
        const active = (subData.data || []).find((s) => s.status === "active");
        if (active?.subscription) setPlan(active.subscription);

        setAllStats(computeStats(allFolderData.data || []));
        setSubStats(computeStats(subFolderData.data || []));
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm mb-5">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Failed to load storage stats. Please try refreshing.
      </div>
    );
  }

  // ── No plan warning ──
  if (!plan) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm mb-5">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        No active subscription found. Please select a plan to start uploading.
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-5">
      {/* ── Section 1: All Folders Stats ── */}
      <CollapsibleSection
        icon={<Globe className="w-3.5 h-3.5" style={{ color: "#5048e5" }} />}
        label="All Folders — Overall Stats"
        accent="#5048e5"
        badge={allStats ? `${allStats.totalFolders} folders` : undefined}
        defaultOpen={true}
      >
        {allStats && (
          <StatGrid
            stats={allStats}
            plan={null}
            accent="#5048e5"
            showPlan={false}
          />
        )}
      </CollapsibleSection>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
            vs
          </span>
        </div>
      </div>

      {/* ── Section 2: Active Subscription Folders Stats ── */}
      <CollapsibleSection
        icon={<Shield className="w-3.5 h-3.5" style={{ color: "#10b981" }} />}
        label="Active Subscription Folders"
        accent="#10b981"
        badge={plan?.name}
        defaultOpen={true}
      >
        {subStats && (
          <StatGrid
            stats={subStats}
            plan={plan}
            accent="#10b981"
            showPlan={true}
          />
        )}
      </CollapsibleSection>
    </div>
  );
}
