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

// ─── Plan badge ───────────────────────────────────────────────────────────────

const planColors = {
  free: { bg: "bg-slate-100", text: "text-slate-600", ring: "#94a3b8" },
  silver: { bg: "bg-blue-50", text: "text-blue-600", ring: "#3b82f6" },
  gold: { bg: "bg-amber-50", text: "text-amber-600", ring: "#f59e0b" },
  diamond: { bg: "bg-violet-50", text: "text-violet-600", ring: "#8b5cf6" },
};

function getPlanStyle(name = "") {
  const key = name.toLowerCase();
  return planColors[key] || planColors.free;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function fmt(n) {
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

// ─── Compute deep stats from flat folders array ───────────────────────────────

function computeStats(folders) {
  let totalFolders = 0;
  let maxNestingUsed = 0;
  let totalFiles = 0;
  let totalSizeMB = 0;
  const formatCounts = { image: 0, video: 0, audio: 0, pdf: 0 };

  const walk = (list) => {
    for (const f of list) {
      totalFolders++;
      if (f.level > maxNestingUsed) maxNestingUsed = f.level;
      if (f.files?.length) {
        for (const file of f.files) {
          totalFiles++;
          totalSizeMB += file.sizeMB || 0;
          if (formatCounts[file.format] !== undefined)
            formatCounts[file.format]++;
        }
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StorageStats() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null); // subscription.subscription
  const [stats, setStats] = useState(null); // computed from folders

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    Promise.all([
      fetch(`${BASE}/api/user/my-subscriptions`, { headers }).then((r) =>
        r.json()
      ),
      fetch(`${BASE}/api/user/folders`, { headers }).then((r) => r.json()),
    ])
      .then(([subData, folderData]) => {
        // active subscription plan details
        const active = (subData.data || []).find((s) => s.status === "active");
        if (active?.subscription) setPlan(active.subscription);

        // compute stats from all folders
        const folders = folderData.data || [];
        setStats(computeStats(folders));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!plan || !stats) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm mb-5">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        No active subscription found. Please select a plan to start uploading.
      </div>
    );
  }

  const planStyle = getPlanStyle(plan.name);

  // ── derived percentages ──
  const folderPct = plan.maxFolders
    ? (stats.totalFolders / plan.maxFolders) * 100
    : 0;
  const filePct = plan.totalFileLimit
    ? (stats.totalFiles / plan.totalFileLimit) * 100
    : 0;
  const nestPct = plan.maxNesting
    ? (stats.maxNestingUsed / plan.maxNesting) * 100
    : 0;

  // Remaining uploads
  const remainingFiles = Math.max(0, plan.totalFileLimit - stats.totalFiles);
  const remainingFolders = Math.max(0, plan.maxFolders - stats.totalFolders);
  const remainingNesting = Math.max(
    0,
    plan.maxNesting - stats.maxNestingUsed - 1
  ); // -1 because 0-indexed

  // File type breakdown
  const formatIcons = {
    image: { icon: FileImage, color: "text-violet-500", label: "Images" },
    video: { icon: FileVideo, color: "text-blue-500", label: "Videos" },
    audio: { icon: FileAudio, color: "text-amber-500", label: "Audio" },
    pdf: { icon: FileText, color: "text-rose-500", label: "PDFs" },
  };

  return (
    <div className="mb-6 space-y-3">
      {/* ── Row 1: Plan badge + 3 stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Plan Card */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col gap-2`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Plan
            </span>
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${planStyle.bg} ${planStyle.text}`}
            >
              {plan.name}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Ring pct={filePct} size={44} stroke={4} color={planStyle.ring} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Crown className={`w-3.5 h-3.5 ${planStyle.text}`} />
              </div>
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 leading-none">
                ${plan.priceMonthly ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">per month</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{plan.allowedTypes?.join(", ") || "—"}</span>
          </div>
        </div>

        {/* Folders Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Folders
            </span>
            <Folder className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {fmt(stats.totalFolders)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                of {fmt(plan.maxFolders)} max
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-500">
                {fmt(remainingFolders)}
              </p>
              <p className="text-[10px] text-slate-400">remaining</p>
            </div>
          </div>
          <Bar pct={folderPct} color="bg-indigo-500" />
        </div>

        {/* Files Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Files
            </span>
            <Files className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {fmt(stats.totalFiles)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                of {fmt(plan.totalFileLimit)} max
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-500">
                {fmt(remainingFiles)}
              </p>
              <p className="text-[10px] text-slate-400">remaining</p>
            </div>
          </div>
          <Bar pct={filePct} color="bg-violet-500" />
        </div>

        {/* Nesting Card */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Nesting
            </span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {stats.maxNestingUsed}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                deepest level used
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-500">
                {remainingNesting}
              </p>
              <p className="text-[10px] text-slate-400">levels left</p>
            </div>
          </div>
          <Bar pct={nestPct} color="bg-sky-500" />
        </div>
      </div>

      {/* ── Row 2: Upload limits + file type breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Upload Limits */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Upload Limits
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-medium">
                Max file size
              </p>
              <p className="text-xl font-black text-slate-900">
                {plan.maxFileSizeMB}{" "}
                <span className="text-sm font-bold text-slate-400">MB</span>
              </p>
              <p className="text-[10px] text-slate-500">per single file</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] text-slate-400 font-medium">
                Per folder limit
              </p>
              <p className="text-xl font-black text-slate-900">
                {plan.filesPerFolder}{" "}
                <span className="text-sm font-bold text-slate-400">files</span>
              </p>
              <p className="text-[10px] text-slate-500">max per folder</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-slate-400 font-medium">
                  Total storage used
                </p>
                <p className="text-[10px] font-bold text-slate-600">
                  {fmtMB(stats.totalSizeMB)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-medium">
                  Files you can still upload
                </p>
                <p
                  className={`text-[10px] font-black ${
                    remainingFiles === 0
                      ? "text-rose-500"
                      : remainingFiles < 10
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                >
                  {remainingFiles} left
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* File Type Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              File Types
            </span>
          </div>

          {stats.totalFiles === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-slate-300">
              <HardDrive className="w-8 h-8 mb-2" />
              <p className="text-xs">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(formatIcons).map(
                ([fmt_, { icon: Icon, color, label }]) => {
                  const count = stats.formatCounts[fmt_] || 0;
                  const pct = stats.totalFiles
                    ? (count / stats.totalFiles) * 100
                    : 0;
                  const allowed = plan.allowedTypes?.includes(fmt_);
                  return (
                    <div key={fmt_} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          allowed ? "bg-slate-50" : "bg-slate-50 opacity-40"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              allowed ? "text-slate-600" : "text-slate-300"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-xs text-slate-400 tabular-nums">
                            {count}
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-1 rounded-full transition-all duration-700 ${color.replace(
                              "text-",
                              "bg-"
                            )}`}
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

          {/* Allowed types badges */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 font-medium mr-1 leading-5">
              Allowed:
            </span>
            {(plan.allowedTypes || []).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold capitalize"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
