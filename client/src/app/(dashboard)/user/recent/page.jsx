"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Loader2,
  Clock,
  Folder,
  ExternalLink,
  Trash2,
  Pencil,
  X,
  Check,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  Search,
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

function getFileIcon(format) {
  switch (format) {
    case "image":
      return <FileImage className="w-5 h-5 text-violet-500" />;
    case "video":
      return <FileVideo className="w-5 h-5 text-sky-500" />;
    case "audio":
      return <FileAudio className="w-5 h-5 text-amber-500" />;
    case "pdf":
      return <FileText className="w-5 h-5 text-rose-500" />;
    default:
      return <FileText className="w-5 h-5 text-slate-400" />;
  }
}

const FORMAT_COLORS = {
  image: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    badge: "bg-violet-100 text-violet-600",
  },
  video: {
    bg: "bg-sky-50",
    border: "border-sky-100",
    badge: "bg-sky-100 text-sky-600",
  },
  audio: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-600",
  },
  pdf: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    badge: "bg-rose-100 text-rose-600",
  },
  other: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    badge: "bg-slate-100 text-slate-500",
  },
};

function getFormatStyle(format) {
  return FORMAT_COLORS[format] || FORMAT_COLORS.other;
}

function formatSize(mb) {
  if (!mb) return "—";
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
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

// ─── Collect all files from flat folder array (with folder name) ──────────────

function collectFiles(folders) {
  const files = [];
  const walk = (list) => {
    for (const f of list) {
      for (const file of f.files || []) {
        files.push({ ...file, folderName: f.name, folderId: f.id });
      }
      if (f.subfolders?.length) walk(f.subfolders);
    }
  };
  walk(folders);
  // Sort by createdAt desc if available, else keep order
  return files.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

// ─── Inline Rename ────────────────────────────────────────────────────────────

function InlineRename({ initialValue, onSave, onCancel }) {
  const [value, setValue] = useState(initialValue);
  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
        className="text-sm border border-[#5048e5]/40 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#5048e5]/20 w-48 bg-white"
      />
      <button
        onClick={() => onSave(value)}
        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function ContextMenu({ x, y, items, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 min-w-[150px]"
        style={{ top: y, left: x }}
      >
        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="my-1 border-t border-slate-100" />
          ) : (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-slate-50 transition-colors cursor-pointer ${
                item.danger ? "text-red-500" : "text-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ label, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Confirm Delete
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Delete{" "}
              <span className="font-semibold text-slate-800">{label}</span>?
              This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File Card ────────────────────────────────────────────────────────────────

function FileCard({ file, onDeleted, onRenamed }) {
  const [renaming, setRenaming] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [menu, setMenu] = useState(null);

  const style = getFormatStyle(file.format);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE}/api/user/files/${file.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("File deleted");
      onDeleted(file.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const handleRename = async (newName) => {
    if (!newName.trim() || newName === file.name) {
      setRenaming(false);
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/user/files/${file.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rename failed");
      toast.success("Renamed");
      onRenamed(file.id, newName.trim());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
      <div
        className={`group relative rounded-2xl border bg-white hover:shadow-md transition-all duration-200 overflow-hidden ${style.border}`}
      >
        {/* Color top strip */}
        <div
          className={`h-1 w-full ${style.bg}`}
          style={{
            background: `linear-gradient(90deg, ${
              file.format === "image"
                ? "#8b5cf6"
                : file.format === "video"
                ? "#0ea5e9"
                : file.format === "audio"
                ? "#f59e0b"
                : "#f43f5e"
            }30, transparent)`,
          }}
        />

        <div className="p-4">
          {/* Top row: icon + menu */}
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-11 h-11 rounded-xl ${style.bg} flex items-center justify-center`}
            >
              {getFileIcon(file.format)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu({ x: e.clientX, y: e.clientY });
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* File name */}
          <div className="mb-2">
            {renaming ? (
              <InlineRename
                initialValue={file.name}
                onSave={handleRename}
                onCancel={() => setRenaming(false)}
              />
            ) : (
              <p
                className="text-sm font-bold text-slate-800 truncate leading-tight"
                title={file.name}
              >
                {file.name}
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${style.badge}`}
            >
              {file.format}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatSize(file.sizeMB)}
            </span>
          </div>

          {/* Folder + time */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 min-w-0">
              <Folder className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-400 truncate">
                {file.folderName}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-slate-300" />
              <span className="text-[11px] text-slate-400">
                {timeAgo(file.createdAt)}
              </span>
            </div>
          </div>

          {/* View link if url exists */}
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#5048e5] hover:text-[#5048e5]/70 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              View file
            </a>
          )}
        </div>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            file.url && {
              label: "Open",
              icon: <ExternalLink className="w-3.5 h-3.5" />,
              onClick: () => window.open(file.url, "_blank"),
            },
            {
              label: "Rename",
              icon: <Pencil className="w-3.5 h-3.5" />,
              onClick: () => setRenaming(true),
            },
            { divider: true },
            {
              label: "Delete",
              icon: <Trash2 className="w-3.5 h-3.5" />,
              danger: true,
              onClick: () => setDeleteModal(true),
            },
          ].filter(Boolean)}
        />
      )}

      {deleteModal && (
        <DeleteModal
          label={file.name}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(false)}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecentFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | image | video | audio | pdf

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/user/folders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      const all = collectFiles(data.data || []);
      setFiles(all.slice(0, 10)); // only latest 10
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const refresh = () => {
    setRefreshing(true);
    fetchFiles();
  };

  const onDeleted = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const onRenamed = (id, name) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));

  // Filter + search
  const visible = files.filter((f) => {
    const matchFormat = filter === "all" || f.format === filter;
    const matchSearch =
      !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.folderName?.toLowerCase().includes(search.toLowerCase());
    return matchFormat && matchSearch;
  });

  const formatCounts = files.reduce((acc, f) => {
    acc[f.format] = (acc[f.format] || 0) + 1;
    return acc;
  }, {});

  const filterTabs = [
    { key: "all", label: "All", count: files.length },
    { key: "image", label: "Images", count: formatCounts.image || 0 },
    { key: "video", label: "Videos", count: formatCounts.video || 0 },
    { key: "audio", label: "Audio", count: formatCounts.audio || 0 },
    { key: "pdf", label: "PDFs", count: formatCounts.pdf || 0 },
  ].filter((t) => t.key === "all" || t.count > 0);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#5048e5]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#5048e5]">
                  Recent Activity
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Recent Files
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Your 10 most recently uploaded files
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search files..."
                  className="pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/10 w-48"
                />
              </div>

              <button
                onClick={refresh}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-400 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab.key
                    ? "bg-[#5048e5] text-white shadow-sm shadow-[#5048e5]/25"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    filter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#5048e5]" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              {search || filter !== "all" ? (
                <>
                  <Search className="w-10 h-10 mb-3 text-slate-200" />
                  <p className="text-sm font-semibold">
                    No files match your filter
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                    className="mt-3 text-xs text-[#5048e5] font-semibold hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <AlertCircle className="w-10 h-10 mb-3 text-slate-200" />
                  <p className="text-sm font-semibold">No files uploaded yet</p>
                  <p className="text-xs mt-1">
                    Head to My Drive to start uploading
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visible.map((file, i) => (
                <div
                  key={file.id}
                  style={{
                    opacity: 0,
                    animation: `fadeSlideUp 0.4s ease forwards`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <FileCard
                    file={file}
                    onDeleted={onDeleted}
                    onRenamed={onRenamed}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Summary Footer ── */}
          {!loading && files.length > 0 && (
            <div className="flex items-center justify-center pt-2">
              <p className="text-xs text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                Showing{" "}
                <span className="font-bold text-slate-600">
                  {visible.length}
                </span>{" "}
                of your{" "}
                <span className="font-bold text-slate-600">{files.length}</span>{" "}
                most recent files
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
