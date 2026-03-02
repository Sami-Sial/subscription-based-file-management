"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  FolderPlus,
  Upload,
  Trash2,
  Pencil,
  X,
  Check,
  ChevronRight,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Loader2,
  MoreVertical,
  Home,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileIcon(format) {
  switch (format) {
    case "image":
      return <FileImage className="w-4 h-4 text-violet-500" />;
    case "video":
      return <FileVideo className="w-4 h-4 text-blue-500" />;
    case "audio":
      return <FileAudio className="w-4 h-4 text-amber-500" />;
    case "pdf":
      return <FileText className="w-4 h-4 text-rose-500" />;
    default:
      return <FileText className="w-4 h-4 text-slate-400" />;
  }
}

function formatSize(mb) {
  if (!mb) return "—";
  if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function detectFormat(file) {
  const mime = file.type || "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return null;
}

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("token"));
  } catch {
    return localStorage.getItem("token");
  }
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// ─── Step 1: Preflight — check limits BEFORE uploading to Cloudinary ──────────

async function checkFileLimits(folderId, format, sizeMB) {
  const params = new URLSearchParams({
    folderId,
    format,
    sizeMB: String(sizeMB),
  });
  const res = await fetch(`${BASE}/api/user/files/check-limits?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "File not allowed by your plan");
  return data; // { allowed: true, remainingTotal, remainingInFolder }
}

// ─── Step 2: Upload to Cloudinary with XHR progress ───────────────────────────

function uploadToCloudinary(file, format, onProgress) {
  return new Promise((resolve, reject) => {
    const resourceType =
      format === "image"
        ? "image"
        : format === "pdf"
        ? "image" // Cloudinary treats PDF as image
        : "video"; // video + audio both use "video"

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "filedrive");

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          sizeMB: parseFloat((result.bytes / (1024 * 1024)).toFixed(4)),
        });
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err?.error?.message || "Cloudinary upload failed"));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
    );
    xhr.send(formData);
  });
}

// ─── Step 3: Save file record to backend ──────────────────────────────────────

async function saveFileToBackend({
  folderId,
  name,
  url,
  publicId,
  format,
  sizeMB,
}) {
  const res = await fetch(`${BASE}/api/user/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ folderId, name, url, publicId, format, sizeMB }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save file");
  return data.data; // File record from DB
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ folderId, onUploaded, onClose }) {
  const [fileItems, setFileItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const inputRef = useRef();
  const isUploadingRef = useRef(false);

  const addFiles = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      format: detectFormat(file),
      sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(4)),
      progress: 0,
      status: "pending", // pending | checking | uploading | saving | done | error
      error: null,
    }));
    setFileItems((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id) =>
    setFileItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id, patch) =>
    setFileItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );

  const startUpload = useCallback(async () => {
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;

    const pending = fileItems.filter((i) => i.status === "pending");

    for (const item of pending) {
      // ── Guard: unsupported MIME ──
      if (!item.format) {
        updateItem(item.id, {
          status: "error",
          error: "Unsupported file type",
        });
        continue;
      }

      // ── STEP 1: Preflight — check limits before doing anything ──
      updateItem(item.id, { status: "checking" });
      try {
        await checkFileLimits(folderId, item.format, item.sizeMB);
      } catch (err) {
        // Limit exceeded — mark error immediately, no Cloudinary upload
        updateItem(item.id, { status: "error", error: err.message });
        continue;
      }

      // ── STEP 2: Upload to Cloudinary ──
      updateItem(item.id, { status: "uploading", progress: 0 });
      let cloudResult;
      try {
        cloudResult = await uploadToCloudinary(
          item.file,
          item.format,
          (progress) => {
            updateItem(item.id, { progress });
          }
        );
      } catch (err) {
        updateItem(item.id, { status: "error", error: err.message });
        continue;
      }

      // ── STEP 3: Save to backend ──
      updateItem(item.id, { status: "saving", progress: 100 });
      try {
        const saved = await saveFileToBackend({
          folderId,
          name: item.name,
          url: cloudResult.url,
          publicId: cloudResult.publicId,
          format: item.format,
          sizeMB: cloudResult.sizeMB,
        });
        updateItem(item.id, { status: "done" });
        onUploaded(saved);
      } catch (err) {
        updateItem(item.id, { status: "error", error: err.message });
      }
    }

    isUploadingRef.current = false;
    setAllDone(true);
  }, [fileItems, folderId, onUploaded]);

  const hasItems = fileItems.length > 0;
  const activeCount = fileItems.filter((i) =>
    ["checking", "uploading", "saving"].includes(i.status)
  ).length;
  const doneCount = fileItems.filter((i) => i.status === "done").length;
  const errorCount = fileItems.filter((i) => i.status === "error").length;
  const pendingCount = fileItems.filter((i) => i.status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Files</h3>
            {hasItems && (
              <p className="text-xs text-slate-400 mt-0.5">
                {doneCount}/{fileItems.length} complete
                {errorCount > 0 && (
                  <span className="text-red-400"> · {errorCount} failed</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? "border-[#5048e5] bg-[#5048e5]/5 scale-[1.01]"
                : "border-slate-200 hover:border-[#5048e5]/50 hover:bg-slate-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
              accept="image/*,video/*,audio/*,application/pdf"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#5048e5]/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#5048e5]" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-slate-400">
                Images, Videos, Audio, PDF — limits apply per your plan
              </p>
            </div>
          </div>

          {/* File List */}
          {hasItems && (
            <div className="space-y-2">
              {fileItems.map((item) => (
                <FileUploadItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {activeCount > 0 &&
                `Processing ${activeCount} file${
                  activeCount !== 1 ? "s" : ""
                }...`}
              {activeCount === 0 &&
                allDone &&
                doneCount > 0 &&
                `${doneCount} file${
                  doneCount !== 1 ? "s" : ""
                } uploaded successfully`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {allDone ? "Close" : "Cancel"}
              </button>
              {!allDone && (
                <button
                  onClick={startUpload}
                  disabled={activeCount > 0 || pendingCount === 0}
                  className="px-4 py-2 text-sm font-semibold bg-[#5048e5] text-white rounded-xl hover:bg-[#5048e5]/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {activeCount > 0 && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {activeCount > 0 ? "Processing..." : "Upload All"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single file upload row with progress bar ─────────────────────────────────

function FileUploadItem({ item, onRemove }) {
  const { name, format, sizeMB, progress, status, error } = item;

  const statusConfig =
    {
      pending: {
        label: "Pending",
        color: "text-slate-400",
        barColor: "bg-slate-200",
        barWidth: "0%",
      },
      checking: {
        label: "Checking limits...",
        color: "text-blue-400",
        barColor: "bg-blue-300",
        barWidth: "100%",
      },
      uploading: {
        label: `Uploading ${progress}%`,
        color: "text-[#5048e5]",
        barColor: "bg-[#5048e5]",
        barWidth: `${progress}%`,
      },
      saving: {
        label: "Saving...",
        color: "text-amber-500",
        barColor: "bg-amber-400",
        barWidth: "100%",
      },
      done: {
        label: "Done",
        color: "text-emerald-500",
        barColor: "bg-emerald-500",
        barWidth: "100%",
      },
      error: {
        label: error || "Failed",
        color: "text-red-500",
        barColor: "bg-red-400",
        barWidth: "100%",
      },
    }[status] || {};

  const barBg = {
    pending: "bg-slate-200",
    checking: "bg-blue-100",
    uploading: "bg-slate-200",
    saving: "bg-amber-100",
    done: "bg-emerald-100",
    error: "bg-red-100",
  }[status];

  const isActive = ["checking", "uploading", "saving"].includes(status);

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        status === "error"
          ? "border-red-100 bg-red-50/50"
          : status === "done"
          ? "border-emerald-100 bg-emerald-50/50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
        {getFileIcon(format)}
      </div>

      {/* Info + Progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
          <span
            className={`text-[10px] font-semibold shrink-0 ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`w-full rounded-full h-1.5 overflow-hidden ${barBg}`}>
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              statusConfig.barColor
            } ${status === "checking" ? "animate-pulse" : ""}`}
            style={{ width: statusConfig.barWidth }}
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-1">{formatSize(sizeMB)}</p>
      </div>

      {/* Right icon */}
      <div className="shrink-0">
        {status === "done" && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        )}
        {status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
        {status === "pending" && (
          <button
            onClick={onRemove}
            className="p-1 text-slate-300 hover:text-red-400 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {isActive && (
          <Loader2 className="w-4 h-4 animate-spin text-[#5048e5]" />
        )}
      </div>
    </div>
  );
}

// ─── Inline Rename Input ──────────────────────────────────────────────────────

function InlineRename({ initialValue, onSave, onCancel }) {
  const [value, setValue] = useState(initialValue);
  return (
    <div
      className="flex items-center gap-1"
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
        className="text-sm border border-[#5048e5]/40 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#5048e5]/20 w-40 bg-white"
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

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">{label}</span>?
              This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
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

// ─── Create Folder Modal ──────────────────────────────────────────────────────

function CreateFolderModal({ parentId, parentLevel, onCreated, onClose }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const body = { name: name.trim() };
      if (parentId) body.parentId = parentId;

      const res = await fetch(`${BASE}/api/user/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create folder");
      toast.success("Folder created");
      onCreated(data.data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">New Folder</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {parentId && (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            Creating subfolder at{" "}
            <span className="font-bold text-[#5048e5]">
              Level {parentLevel + 1}
            </span>
          </p>
        )}

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Folder name"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#5048e5] focus:ring-2 focus:ring-[#5048e5]/10"
        />

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="px-4 py-2 text-sm font-semibold bg-[#5048e5] text-white rounded-xl hover:bg-[#5048e5]/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File Row ─────────────────────────────────────────────────────────────────

function FileRow({ file, onDeleted, onRenamed }) {
  const [renaming, setRenaming] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [menu, setMenu] = useState(null);

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
      toast.success("File renamed");
      onRenamed(file.id, newName.trim());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl group transition-colors">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          {getFileIcon(file.format)}
        </div>
        <div className="flex-1 min-w-0">
          {renaming ? (
            <InlineRename
              initialValue={file.name}
              onSave={handleRename}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 truncate">
              {file.name}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {file.format} · {formatSize(file.sizeMB)}
          </p>
        </div>
        {!renaming && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenu({ x: e.clientX, y: e.clientY });
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 cursor-pointer transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
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
    </>
  );
}

// ─── Folder Row ───────────────────────────────────────────────────────────────

function FolderRow({ folder, onOpen, onDeleted, onRenamed }) {
  const [renaming, setRenaming] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [menu, setMenu] = useState(null);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE}/api/user/folders/${folder.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Folder deleted");
      onDeleted(folder.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const handleRename = async (newName) => {
    if (!newName.trim() || newName === folder.name) {
      setRenaming(false);
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/user/folders/${folder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rename failed");
      toast.success("Folder renamed");
      onRenamed(folder.id, newName.trim());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenaming(false);
    }
  };

  return (
    <>
      <div
        onClick={() => !renaming && onOpen(folder)}
        className="flex items-center gap-3 px-4 py-3 hover:bg-[#5048e5]/5 rounded-xl group transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-[#5048e5]/10 flex items-center justify-center shrink-0">
          <Folder className="w-4 h-4 text-[#5048e5]" />
        </div>
        <div className="flex-1 min-w-0">
          {renaming ? (
            <InlineRename
              initialValue={folder.name}
              onSave={handleRename}
              onCancel={() => setRenaming(false)}
            />
          ) : (
            <p className="text-sm font-medium text-slate-800 truncate">
              {folder.name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">Level {folder.level}</span>
            {folder.subfolders?.length > 0 && (
              <span className="text-xs text-slate-400">
                · {folder.subfolders.length} subfolder
                {folder.subfolders.length !== 1 ? "s" : ""}
              </span>
            )}
            {folder.files?.length > 0 && (
              <span className="text-xs text-slate-400">
                · {folder.files.length} file
                {folder.files.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        {!renaming && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenu({ x: e.clientX, y: e.clientY });
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 cursor-pointer transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
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
          ]}
        />
      )}

      {deleteModal && (
        <DeleteModal
          label={folder.name}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(false)}
        />
      )}
    </>
  );
}

// ─── Main File Manager ────────────────────────────────────────────────────────

export default function FileManager() {
  const [allFolders, setAllFolders] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [stack, setStack] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const currentFolder = stack[stack.length - 1] || null;

  const fetchAll = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(`${BASE}/api/user/folders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load folders");
      setAllFolders(data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const currentFolderData = currentFolder
    ? allFolders.find((f) => f.id === currentFolder.id)
    : null;
  const visibleFolders = currentFolder
    ? currentFolderData?.subfolders || []
    : allFolders.filter((f) => !f.parentId);
  const visibleFiles = currentFolder ? currentFolderData?.files || [] : [];

  const openFolder = (folder) =>
    setStack((prev) => [
      ...prev,
      { id: folder.id, name: folder.name, level: folder.level },
    ]);
  const navigateTo = (index) =>
    setStack(index === -1 ? [] : stack.slice(0, index + 1));

  const onFolderCreated = (folder) => {
    setAllFolders((prev) => {
      if (folder.parentId) {
        return prev.map((f) =>
          f.id === folder.parentId
            ? { ...f, subfolders: [...(f.subfolders || []), folder] }
            : f
        );
      }
      return [...prev, { ...folder, subfolders: [], files: [] }];
    });
  };

  const onFolderDeleted = (id) => {
    setAllFolders((prev) => {
      const withoutDeleted = prev.filter((f) => f.id !== id);
      return withoutDeleted.map((f) => ({
        ...f,
        subfolders: (f.subfolders || []).filter((s) => s.id !== id),
      }));
    });
    if (currentFolder?.id === id) navigateTo(stack.length - 2);
  };

  const onFolderRenamed = (id, name) => {
    setAllFolders((prev) =>
      prev.map((f) => ({
        ...f,
        ...(f.id === id ? { name } : {}),
        subfolders: (f.subfolders || []).map((s) =>
          s.id === id ? { ...s, name } : s
        ),
      }))
    );
    setStack((prev) =>
      prev.map((crumb) => (crumb.id === id ? { ...crumb, name } : crumb))
    );
  };

  const onFileUploaded = (file) => {
    setAllFolders((prev) =>
      prev.map((f) =>
        f.id === file.folderId ? { ...f, files: [...(f.files || []), file] } : f
      )
    );
  };

  const onFileDeleted = (fileId) => {
    setAllFolders((prev) =>
      prev.map((f) => ({
        ...f,
        files: (f.files || []).filter((fi) => fi.id !== fileId),
      }))
    );
  };

  const onFileRenamed = (fileId, name) => {
    setAllFolders((prev) =>
      prev.map((f) => ({
        ...f,
        files: (f.files || []).map((fi) =>
          fi.id === fileId ? { ...fi, name } : fi
        ),
      }))
    );
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
        }}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-4 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            <button
              onClick={() => navigateTo(-1)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#5048e5] transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Root</span>
            </button>
            {stack.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  onClick={() => navigateTo(i)}
                  className={`text-sm font-medium transition-colors cursor-pointer truncate max-w-[120px] ${
                    i === stack.length - 1
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-[#5048e5]"
                  }`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
            {currentFolder && (
              <span className="ml-1 text-xs text-[#5048e5] bg-[#5048e5]/10 px-2 py-0.5 rounded-full font-semibold shrink-0">
                Level {currentFolder.level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentFolder && (
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            )}
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-[#5048e5] text-white rounded-xl hover:bg-[#5048e5]/90 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* Contents */}
        <div className="p-5">
          {fetchLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#5048e5]" />
            </div>
          ) : visibleFolders.length === 0 && visibleFiles.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Folder className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium">
                {currentFolder ? "This folder is empty" : "No folders yet"}
              </p>
              <p className="text-xs mt-1">
                {currentFolder
                  ? "Create a subfolder or upload files"
                  : "Create your first folder to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {visibleFolders.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-1">
                    Folders ({visibleFolders.length})
                  </p>
                  {visibleFolders.map((folder) => (
                    <FolderRow
                      key={folder.id}
                      folder={folder}
                      onOpen={openFolder}
                      onDeleted={onFolderDeleted}
                      onRenamed={onFolderRenamed}
                    />
                  ))}
                </div>
              )}
              {visibleFiles.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-1 mt-3">
                    Files ({visibleFiles.length})
                  </p>
                  {visibleFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onDeleted={onFileDeleted}
                      onRenamed={onFileRenamed}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          parentId={currentFolder?.id || null}
          parentLevel={currentFolder?.level ?? -1}
          onCreated={onFolderCreated}
          onClose={() => setShowCreateFolder(false)}
        />
      )}

      {showUpload && currentFolder && (
        <UploadModal
          folderId={currentFolder.id}
          onUploaded={onFileUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}
    </>
  );
}
