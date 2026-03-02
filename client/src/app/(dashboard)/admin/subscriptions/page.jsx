"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const inputClass =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all";

const labelClass =
  "block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5";

// allowedTypes is stored as array of strings e.g. ["image", "video", "pdf", "audio"]
const ALL_TYPES = ["image", "video", "pdf", "audio"];

function parseAllowedTypes(allowedTypes) {
  if (!allowedTypes || !Array.isArray(allowedTypes))
    return { image: false, video: false, pdf: false, audio: false };
  return {
    image: allowedTypes.includes("image"),
    video: allowedTypes.includes("video"),
    pdf: allowedTypes.includes("pdf"),
    audio: allowedTypes.includes("audio"),
  };
}

function buildAllowedTypes(fileTypes) {
  return ALL_TYPES.filter((type) => fileTypes[type]);
}

const fileTypeColors = {
  image: "bg-violet-50 text-violet-600 border-violet-200",
  video: "bg-blue-50 text-blue-600 border-blue-200",
  pdf: "bg-rose-50 text-rose-600 border-rose-200",
  audio: "bg-amber-50 text-amber-600 border-amber-200",
};

function FileTypeBadge({ label, color }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${color}`}
    >
      {label}
    </span>
  );
}

function FormFields({ data, onChange, onToggle }) {
  return (
    <div className="space-y-6">
      {/* Identification */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
          Identification
        </p>
        <div>
          <label className={labelClass}>Package Name</label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={onChange}
            placeholder="e.g. Free, Silver, Gold, Diamond"
            className={inputClass}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Max Folders</label>
            <input
              type="number"
              name="maxFolders"
              value={data.maxFolders}
              onChange={onChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Nesting Level</label>
            <select
              name="maxNesting"
              value={data.maxNesting}
              onChange={onChange}
              className={inputClass + " cursor-pointer bg-white"}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n} Level{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Policies */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
          File Policies
        </p>
        <div>
          <label className={labelClass}>Allowed File Types</label>
          <div className="flex flex-wrap gap-2.5 mt-2">
            {["image", "video", "pdf", "audio"].map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all select-none text-sm font-medium ${
                  data.fileTypes?.[type]
                    ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  name={`fileTypes.${type}`}
                  checked={data.fileTypes?.[type] || false}
                  onChange={onChange}
                  className="hidden"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Max File Size</label>
          <div className="relative">
            <input
              type="number"
              name="maxFileSizeMB"
              value={data.maxFileSizeMB}
              onChange={onChange}
              className={inputClass + " pr-14"}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
              MB
            </span>
          </div>
        </div>
      </div>

      {/* Volume Limits */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
          Volume Limits
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Total File Limit</label>
            <input
              type="number"
              name="totalFileLimit"
              value={data.totalFileLimit}
              onChange={onChange}
              placeholder="e.g. 10000"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Files Per Folder</label>
            <input
              type="number"
              name="filesPerFolder"
              value={data.filesPerFolder}
              onChange={onChange}
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
          Pricing <span className="normal-case font-normal">(optional)</span>
        </p>
        <div>
          <label className={labelClass}>Monthly Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
              $
            </span>
            <input
              type="number"
              name="priceMonthly"
              value={data.priceMonthly}
              onChange={onChange}
              placeholder="0.00"
              className={inputClass + " pl-8"}
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
          Status
        </p>
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Package Status
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {data.isActive
                ? "This package is visible and available to users."
                : "This package is hidden and unavailable to users."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggle("isActive", !data.isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              data.isActive ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                data.isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

const defaultForm = {
  name: "",
  maxFolders: 100,
  maxNesting: 5,
  fileTypes: { image: true, video: true, pdf: true, audio: false },
  maxFileSizeMB: 500,
  totalFileLimit: "",
  filesPerFolder: 100,
  priceMonthly: "",
  priceYearly: "",
  isActive: true,
};

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [updateFormData, setUpdateFormData] = useState({ ...defaultForm });

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch subscriptions");
      setSubscriptions(data.data.subscriptions || []);
    } catch (error) {
      toast.error(error.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Calculate stats from actual subscription data
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((sub) => sub.isActive).length,
    inactive: subscriptions.filter((sub) => !sub.isActive).length,
    avgPrice:
      subscriptions.length > 0
        ? (
            subscriptions.reduce(
              (sum, sub) => sum + (sub.priceMonthly || 0),
              0
            ) / subscriptions.length
          ).toFixed(2)
        : "0.00",
  };

  // Generic change handler factory
  const handleChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("fileTypes.")) {
      const fileType = name.split(".")[1];
      setter((prev) => ({
        ...prev,
        fileTypes: { ...prev.fileTypes, [fileType]: checked },
      }));
    } else {
      setter((prev) => ({
        ...prev,
        [name]:
          type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
      }));
    }
  };

  // Toggle handler for boolean fields (e.g. isActive)
  const handleToggle = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  // Convert UI state → API payload (fileTypes → allowedTypes array)
  const buildPayload = ({ fileTypes, ...rest }) => ({
    ...rest,
    allowedTypes: buildAllowedTypes(fileTypes),
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(buildPayload(formData)),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create subscription");
      toast.success("Package created successfully!");
      fetchSubscriptions();
      setFormData(defaultForm);
    } catch (error) {
      toast.error(error.message || "Failed to create subscription");
    } finally {
      setFormLoading(false);
    }
  };

  const openUpdateModal = (sub) => {
    setSelectedSubscription(sub);
    setUpdateFormData({
      name: sub.name || "",
      maxFolders: sub.maxFolders || 0,
      maxNesting: sub.maxNesting || 0,
      fileTypes: parseAllowedTypes(sub.allowedTypes),
      maxFileSizeMB: sub.maxFileSizeMB || 0,
      totalFileLimit: sub.totalFileLimit || "",
      filesPerFolder: sub.filesPerFolder || 0,
      priceMonthly: sub.priceMonthly ?? "",
      priceYearly: sub.priceYearly ?? "",
      isActive: sub.isActive ?? true,
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/subscriptions/${selectedSubscription.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(buildPayload(updateFormData)),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update subscription");
      toast.success("Package updated successfully!");
      fetchSubscriptions();
      setShowUpdateModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to update subscription");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/subscriptions/${selectedSubscription.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete subscription");
      toast.success("Package deleted successfully!");
      fetchSubscriptions();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to delete subscription");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Subscription Packages
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Manage tier limits, storage capacities, and file access policies
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-600">
              System Active
            </span>
          </div>
        </div>

        {/* Stats Cards - Dynamic Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Packages",
              value: stats.total,
              icon: Package,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
              gradient: "from-blue-500/10 to-transparent",
            },
            {
              label: "Active Packages",
              value: stats.active,
              icon: CheckCircle,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              gradient: "from-emerald-500/10 to-transparent",
            },
            {
              label: "Inactive Packages",
              value: stats.inactive,
              icon: XCircle,
              color: "text-gray-600",
              bg: "bg-gray-50",
              border: "border-gray-100",
              gradient: "from-gray-500/10 to-transparent",
            },
            {
              label: "Avg. Monthly Price",
              value: `$${stats.avgPrice}`,
              icon: TrendingUp,
              color: "text-violet-600",
              bg: "bg-violet-50",
              border: "border-violet-100",
              gradient: "from-violet-500/10 to-transparent",
            },
          ].map(({ label, value, icon: Icon, color, bg, border, gradient }) => (
            <div
              key={label}
              className={`relative bg-white border ${border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all overflow-hidden group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 leading-none">
                    {value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${bg} ring-1 ring-black/5`}>
                  <Icon size={20} className={color} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                All Packages
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage and configure subscription tiers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-600">
                  {subscriptions.length} Total
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400 font-medium">
                Loading packages...
              </p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Package size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                No packages found
              </p>
              <p className="text-xs text-gray-400">
                Create your first subscription package below
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                    {[
                      "Tier Name",
                      "Folders",
                      "Nesting",
                      "File Types",
                      "Max Size",
                      "Total Limit",
                      "Price / mo",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscriptions.map((sub) => {
                    const ft = parseAllowedTypes(sub.allowedTypes);
                    return (
                      <tr
                        key={sub.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all group"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900 text-base">
                            {sub.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 tracking-wider">
                            ID: {sub.id}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                            {sub.maxFolders}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700">
                            {sub.maxNesting} lvl
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {ft.image && (
                              <FileTypeBadge
                                label="IMG"
                                color={fileTypeColors.image}
                              />
                            )}
                            {ft.video && (
                              <FileTypeBadge
                                label="VID"
                                color={fileTypeColors.video}
                              />
                            )}
                            {ft.pdf && (
                              <FileTypeBadge
                                label="PDF"
                                color={fileTypeColors.pdf}
                              />
                            )}
                            {ft.audio && (
                              <FileTypeBadge
                                label="AUD"
                                color={fileTypeColors.audio}
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-gray-700">
                            {sub.maxFileSizeMB}{" "}
                            <span className="text-xs text-gray-400 font-normal">
                              MB
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-gray-700">
                            {sub.totalFileLimit.toLocaleString()}{" "}
                            <span className="text-xs text-gray-400 font-normal">
                              files
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {sub.priceMonthly != null ? (
                            <span className="text-sm font-bold text-gray-900">
                              ${sub.priceMonthly}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 font-medium">
                              Free
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm ${
                              sub.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                sub.isActive ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                            />
                            {sub.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openUpdateModal(sub)}
                              className="p-2.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-200"
                              title="Edit package"
                            >
                              <Edit2 size={15} strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubscription(sub);
                                setShowDeleteModal(true);
                              }}
                              className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200"
                              title="Delete package"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Form */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-xl shadow-sm">
              <Plus size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Create New Package
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Define a new subscription tier with custom limits
              </p>
            </div>
          </div>
          <form onSubmit={handleCreate} className="p-6 space-y-6">
            <FormFields
              data={formData}
              onChange={handleChange(setFormData)}
              onToggle={handleToggle(setFormData)}
            />
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setFormData(defaultForm)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
              >
                {formLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Create Package"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUpdateModal(false)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500 rounded-xl shadow-sm">
                  <Edit2 size={15} className="text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Update Package
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Modify subscription settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <FormFields
                data={updateFormData}
                onChange={handleChange(setUpdateFormData)}
                onToggle={handleToggle(setUpdateFormData)}
              />
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
                >
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update Package"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl shrink-0">
                <AlertCircle
                  size={22}
                  className="text-red-600"
                  strokeWidth={2.5}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900">
                  Delete Package
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-gray-900">
                    {selectedSubscription?.name}
                  </span>
                  ? This action cannot be undone and may affect existing users.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-red-600/25 cursor-pointer"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Package"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
