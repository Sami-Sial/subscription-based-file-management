"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
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
  Eye,
  Download,
  ZoomIn,
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
const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

// ─── Format config ────────────────────────────────────────────────────────────

const FMT = {
  image: {
    icon: FileImage,
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-100",
    badge: "bg-violet-100 text-violet-700",
    label: "Image",
  },
  video: {
    icon: FileVideo,
    color: "#0ea5e9",
    bg: "bg-sky-50",
    border: "border-sky-100",
    badge: "bg-sky-100 text-sky-700",
    label: "Video",
  },
  audio: {
    icon: FileAudio,
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badge: "bg-amber-100 text-amber-700",
    label: "Audio",
  },
  pdf: {
    icon: FileText,
    color: "#f43f5e",
    bg: "bg-rose-50",
    border: "border-rose-100",
    badge: "bg-rose-100 text-rose-700",
    label: "PDF",
  },
  other: {
    icon: FileText,
    color: "#94a3b8",
    bg: "bg-slate-50",
    border: "border-slate-100",
    badge: "bg-slate-100 text-slate-600",
    label: "File",
  },
};

function getFmt(format) {
  return FMT[format] || FMT.other;
}

function FileIcon({ format, className = "w-5 h-5" }) {
  const { icon: Icon, color } = getFmt(format);
  return <Icon className={className} style={{ color }} />;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtSize(mb) {
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

function collectFiles(folders) {
  const files = [];
  const walk = (list) => {
    for (const f of list) {
      for (const file of f.files || [])
        files.push({ ...file, folderName: f.name, folderId: f.id });
      if (f.subfolders?.length) walk(f.subfolders);
    }
  };
  walk(folders);
  return files.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
}

// ─── Context Menu — viewport-aware fixed position ─────────────────────────────
// Key fix: useLayoutEffect reads button rect BEFORE paint, places menu correctly.

function ContextMenu({ triggerRef, items, onClose }) {
  const menuRef = useRef(null);
  const [style, setStyle] = useState({ opacity: 0, top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const btn = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Vertical: prefer below, flip up if not enough room
    let top = btn.bottom + 6;
    if (top + menu.height > vh - 8) top = btn.top - menu.height - 6;

    // Horizontal: right-align to button, clamp to viewport
    let left = btn.right - menu.width;
    if (left < 8) left = btn.left;
    if (left + menu.width > vw - 8) left = vw - menu.width - 8;

    setStyle({ opacity: 1, top, left });
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[998]" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-[999] bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 min-w-[176px] transition-opacity duration-100"
        style={style}
      >
        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="my-1 mx-2 border-t border-slate-100" />
          ) : (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer rounded-lg mx-0 ${
                item.danger
                  ? "text-rose-500 hover:bg-rose-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                style={
                  item.danger ? { color: "#f43f5e" } : { color: "#64748b" }
                }
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        )}
      </div>
    </>
  );
}

// ─── File View Modal — full-width, enhanced ───────────────────────────────────

function FileViewModal({ file, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const fmt = getFmt(file.format);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(file.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const Preview = () => {
    switch (file.format) {
      case "image":
        return (
          <div className="w-full h-full flex items-center justify-center p-6 bg-[#0f0f14]">
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-xl select-none"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            />
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center bg-black">
            <video
              src={file.url}
              controls
              autoPlay={false}
              className="max-w-full max-h-full rounded-lg"
              style={{ maxHeight: "calc(100vh - 180px)" }}
            />
          </div>
        );
      case "audio":
        return (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-8 px-8"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, ${fmt.color}18 0%, #f8fafc 70%)`,
            }}
          >
            {/* Animated waveform art */}
            <div className="relative flex items-center justify-center">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${fmt.color}22, ${fmt.color}44)`,
                  border: `2px solid ${fmt.color}30`,
                }}
              >
                <FileIcon format="audio" className="w-14 h-14" />
              </div>
              {/* Pulse rings */}
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="absolute rounded-full animate-ping"
                  style={{
                    width: `${128 + n * 36}px`,
                    height: `${128 + n * 36}px`,
                    background: `${fmt.color}08`,
                    border: `1px solid ${fmt.color}20`,
                    animationDuration: `${1.5 + n * 0.4}s`,
                    animationDelay: `${n * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-900 max-w-sm truncate">
                {file.name}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {fmtSize(file.sizeMB)} · {file.folderName}
              </p>
            </div>
            <audio
              src={file.url}
              controls
              className="w-full max-w-md rounded-xl"
              style={{ accentColor: fmt.color }}
            />
          </div>
        );
      case "pdf":
        return (
          <div className="w-full h-full bg-slate-100">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileIcon format={file.format} className="w-10 h-10" />
            </div>
            <p className="text-sm font-medium">Preview not available</p>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#5048e5] hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open file directly
            </a>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          width: "min(860px, calc(100vw - 32px))",
          height: "min(640px, calc(100vh - 48px))",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 shrink-0 bg-white z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${fmt.color}15` }}
          >
            <FileIcon format={file.format} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">
              {file.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
                style={{ background: `${fmt.color}18`, color: fmt.color }}
              >
                {fmt.label}
              </span>
              <span className="text-xs text-slate-400">
                {fmtSize(file.sizeMB)}
              </span>
              {file.folderName && (
                <>
                  <span className="text-slate-200">·</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Folder className="w-3 h-3" />
                    {file.folderName}
                  </span>
                </>
              )}
              {file.createdAt && (
                <>
                  <span className="text-slate-200">·</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {timeAgo(file.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Preview area — fills all remaining height ── */}
        <div className="flex-1 overflow-hidden min-h-0">
          <Preview />
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-[#5048e5] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </a>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl cursor-pointer disabled:opacity-60 transition-all active:scale-95"
            style={{ background: fmt.color }}
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Rename ────────────────────────────────────────────────────────────

function splitFilename(name) {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

function InlineRename({ initialValue, onSave, onCancel }) {
  const { base, ext } = splitFilename(initialValue);
  const [value, setValue] = useState(base);

  const commit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSave(trimmed + ext); // reattach original extension unchanged
  };

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center border border-[#5048e5]/40 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#5048e5]/20 bg-white">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") onCancel();
          }}
          className="text-sm px-2 py-0.5 outline-none w-28 bg-white"
        />
        {ext && (
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 border-l border-slate-200 select-none shrink-0">
            {ext}
          </span>
        )}
      </div>
      <button
        onClick={commit}
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ label, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-rose-50 rounded-xl shrink-0">
            <Trash2 className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete file?</h3>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-800">{label}</span> will
              be permanently removed.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File Card ────────────────────────────────────────────────────────────────

function FileCard({ file, onDeleted, onRenamed, index }) {
  const [renaming, setRenaming] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const menuBtnRef = useRef(null);

  const fmt = getFmt(file.format);

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
        className={`group relative bg-white rounded-2xl border hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer ${fmt.border}`}
        style={{
          animation: `fadeUp 0.35s ease both`,
          animationDelay: `${index * 0.04}s`,
        }}
        onClick={() => !renaming && setViewModal(true)}
      >
        {/* Accent top bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: `linear-gradient(90deg, ${fmt.color}, ${fmt.color}00)`,
          }}
        />

        {/* Preview thumbnail strip for images */}
        {file.format === "image" && file.url && (
          <div className="relative w-full h-28 overflow-hidden bg-slate-100">
            <img
              src={file.url}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <ZoomIn className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Non-image: icon area */}
        {file.format !== "image" && (
          <div
            className="w-full h-20 flex items-center justify-center"
            style={{ background: `${fmt.color}08` }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: `${fmt.color}18` }}
            >
              <FileIcon format={file.format} className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Card body */}
        <div className="p-3.5">
          {/* Name row + menu */}
          <div
            className="flex items-start justify-between gap-1 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-w-0">
              {renaming ? (
                <InlineRename
                  initialValue={file.name}
                  onSave={handleRename}
                  onCancel={() => setRenaming(false)}
                />
              ) : (
                <p
                  className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-[#5048e5] transition-colors"
                  title={file.name}
                >
                  {file.name}
                </p>
              )}
            </div>
            {!renaming && (
              <button
                ref={menuBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer transition-all shrink-0 -mt-0.5"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize shrink-0"
                style={{ background: `${fmt.color}15`, color: fmt.color }}
              >
                {fmt.label}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {fmtSize(file.sizeMB)}
              </span>
            </div>
          </div>

          {/* Footer: folder + time */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Folder className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="text-[10px] text-slate-400 truncate">
                {file.folderName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] text-slate-400">
                {timeAgo(file.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <ContextMenu
          triggerRef={menuBtnRef}
          onClose={() => setMenuOpen(false)}
          items={[
            {
              label: "Preview",
              icon: <Eye className="w-4 h-4" />,
              onClick: () => setViewModal(true),
            },
            {
              label: "Rename",
              icon: <Pencil className="w-4 h-4" />,
              onClick: () => setRenaming(true),
            },
            { divider: true },
            {
              label: "Delete",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => setDeleteModal(true),
              danger: true,
            },
          ]}
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
      {viewModal && (
        <FileViewModal file={file} onClose={() => setViewModal(false)} />
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RecentFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/user/all-folders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");
      setFiles(collectFiles(data.data || []).slice(0, 10));
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
  const onDeleted = (id) => setFiles((p) => p.filter((f) => f.id !== id));
  const onRenamed = (id, name) =>
    setFiles((p) => p.map((f) => (f.id === id ? { ...f, name } : f)));

  const visible = files.filter((f) => {
    const mFmt = filter === "all" || f.format === filter;
    const mQ =
      !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.folderName?.toLowerCase().includes(search.toLowerCase());
    return mFmt && mQ;
  });

  const counts = files.reduce(
    (a, f) => ({ ...a, [f.format]: (a[f.format] || 0) + 1 }),
    {}
  );
  const tabs = [
    { key: "all", label: "All", count: files.length },
    { key: "image", label: "Images", count: counts.image || 0 },
    { key: "video", label: "Videos", count: counts.video || 0 },
    { key: "audio", label: "Audio", count: counts.audio || 0 },
    { key: "pdf", label: "PDFs", count: counts.pdf || 0 },
  ].filter((t) => t.key === "all" || t.count > 0);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "12px", border: "1px solid #e2e8f0" },
        }}
      />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#5048e5]" />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#5048e5]">
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
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-400 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => {
              const active = filter === tab.key;
              const color = tab.key !== "all" ? FMT[tab.key]?.color : "#5048e5";
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                  style={active ? { background: color } : {}}
                >
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visible.map((file, i) => (
                <FileCard
                  key={file.id}
                  file={file}
                  index={i}
                  onDeleted={onDeleted}
                  onRenamed={onRenamed}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && files.length > 0 && (
            <div className="flex items-center justify-center pt-1">
              <p className="text-xs text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                Showing{" "}
                <span className="font-bold text-slate-600">
                  {visible.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-600">{files.length}</span>{" "}
                recent files
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
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
