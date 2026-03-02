"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Trash2,
  AlertCircle,
  UserCheck,
  UserX,
  TrendingUp,
  Crown,
  Mail,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubscription, setFilterSubscription] = useState("all");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch users");
      setUsers(data.data.users || data.users || []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Calculate stats from user data
  const stats = {
    total: users.length,
    active: users.filter((user) => user.isActive !== false).length,
    inactive: users.filter((user) => user.isActive === false).length,
    subscribed: users.filter((user) => user.subscription || user.subscriptionId)
      .length,
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete user");
      toast.success("User deleted successfully!");
      fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterSubscription === "all" ||
      (filterSubscription === "subscribed" &&
        (user.subscription || user.subscriptionId)) ||
      (filterSubscription === "free" &&
        !user.subscription &&
        !user.subscriptionId);

    return matchesSearch && matchesFilter;
  });

  // Get unique subscription types
  const subscriptionTypes = [
    ...new Set(
      users
        .map((user) => user.subscription?.name || user.subscriptionName)
        .filter(Boolean)
    ),
  ];

  return (
    <>
      <div className="min-h-screen max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Manage registered users and their subscriptions
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-gray-600">
              {stats.total} Total Users
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.total,
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-100",
              gradient: "from-blue-500/10 to-transparent",
            },
            {
              label: "Active Users",
              value: stats.active,
              icon: UserCheck,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
              gradient: "from-emerald-500/10 to-transparent",
            },
            {
              label: "Inactive Users",
              value: stats.inactive,
              icon: UserX,
              color: "text-gray-600",
              bg: "bg-gray-50",
              border: "border-gray-100",
              gradient: "from-gray-500/10 to-transparent",
            },
            {
              label: "Subscribed Users",
              value: stats.subscribed,
              icon: Crown,
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

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter size={16} />
                <span className="font-medium">Filter:</span>
              </div>
              <div className="flex gap-2">
                {["all", "subscribed", "free"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterSubscription(filter)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      filterSubscription === filter
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-base font-bold text-gray-900">All Users</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage and monitor user accounts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-600">
                  {filteredUsers.length}{" "}
                  {filterSubscription !== "all" ? "Filtered" : "Total"}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-400 font-medium">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                No users found
              </p>
              <p className="text-xs text-gray-400">
                {searchQuery || filterSubscription !== "all"
                  ? "Try adjusting your filters"
                  : "No users registered yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                    {[
                      "User",
                      "Email",
                      "Joined",
                      "Subscription",
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
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {user.name || "Unknown User"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 tracking-wider">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {user.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {formatDate(user.createdAt || user.joinedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {user.subscription?.name || user.subscriptionName ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg text-xs font-bold text-violet-700 shadow-sm">
                            <Crown size={12} />
                            {user.subscription?.name || user.subscriptionName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm ${
                            user.isActive !== false
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isActive !== false
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {user.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200"
                          title="Delete user"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {subscriptionTypes.length > 0 && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-violet-500 rounded-xl shadow-sm shrink-0">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Subscription Distribution
                </h3>
                <div className="flex flex-wrap gap-3">
                  {subscriptionTypes.map((subName) => {
                    const count = users.filter(
                      (u) =>
                        u.subscription?.name === subName ||
                        u.subscriptionName === subName
                    ).length;
                    return (
                      <div
                        key={subName}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-violet-200 rounded-xl"
                      >
                        <Crown size={14} className="text-violet-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {subName}
                        </span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">
                      Free
                    </span>
                    <span className="text-xs text-gray-500">
                      ({stats.total - stats.subscribed})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
                  Delete User
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-gray-900">
                    {selectedUser?.name || selectedUser?.email}
                  </span>
                  ? This will permanently remove their account and all
                  associated data. This action cannot be undone.
                </p>
                {selectedUser?.subscription && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 font-medium">
                      ⚠️ This user has an active subscription (
                      {selectedUser.subscription.name ||
                        selectedUser.subscriptionName}
                      )
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-red-600/25 cursor-pointer"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
