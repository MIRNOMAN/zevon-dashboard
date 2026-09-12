"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Power,
  X,
  Crown,
  User,
  ShoppingBag,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  type UserDirectoryItem,
  type UserRole,
} from "@/redux/api/dashboardApi";
import { formatDate, getErrorMessage } from "@/lib/utils";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Status feedback state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Role changing state per user ID for spinner
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDirectoryItem | null>(null);

  // Queries & Mutations
  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    search: searchTerm.trim() || undefined,
  });

  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const rawData = res?.data;
  const users: UserDirectoryItem[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if ("users" in rawData && Array.isArray(rawData.users)) {
      return rawData.users;
    }
    return [];
  }, [rawData]);

  const meta = rawData && "meta" in rawData ? rawData.meta : { total: users.length, page: 1, totalPages: 1 };

  // Calculate summary metrics
  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u) => u.role === "CUSTOMER").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const managers = users.filter((u) => u.role === "MANAGER").length;
    return { total, customers, admins, managers };
  }, [users]);

  // Show Toast
  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handle Role Change
  const handleRoleChange = async (user: UserDirectoryItem, newRole: UserRole) => {
    if (user.role === newRole) return;
    if (user.email === "admin@example.com" && newRole !== "ADMIN") {
      showToast("error", "The Master Admin account role cannot be changed.");
      return;
    }

    setUpdatingUserId(user.id);
    try {
      await updateUserRole({ id: user.id, role: newRole }).unwrap();
      showToast("success", `Updated role for ${user.name || user.email} to ${newRole}`);
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to update user role"));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle Status Toggle (Active / Inactive)
  const handleStatusToggle = async (user: UserDirectoryItem) => {
    if (user.email === "admin@example.com") {
      showToast("error", "The Master Admin account cannot be deactivated.");
      return;
    }

    setUpdatingUserId(user.id);
    try {
      await updateUserStatus({ id: user.id, isActive: !user.isActive }).unwrap();
      showToast(
        "success",
        `Account for ${user.name || user.email} is now ${!user.isActive ? "Active" : "Suspended"}`
      );
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to update user status"));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    if (deletingUser.email === "admin@example.com") {
      showToast("error", "The Master Admin account cannot be deleted.");
      setDeletingUser(null);
      return;
    }

    try {
      await deleteUser(deletingUser.id).unwrap();
      showToast("success", `User ${deletingUser.email} has been deleted.`);
      setDeletingUser(null);
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to delete user"));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Users className="w-6 h-6" />
            </span>
            <span>Customer Directory & Role Management</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            View registered user accounts, manage RBAC administrative roles, and regulate access permissions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50 w-fit self-start sm:self-auto flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Toast Feedback Notification ───────────────────────── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Summary Stats Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400">Registered users in database</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Customers</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.customers}
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">Standard shopping accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Administrators</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.admins}
          </div>
          <p className="text-[11px] text-amber-400/90 font-medium">Full dashboard superusers</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Managers</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.managers}
          </div>
          <p className="text-[11px] text-sky-400/90 font-medium">Catalog & order controllers</p>
        </div>
      </div>

      {/* ── Filters & Search ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-md">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { label: "All Users", val: "ALL" },
              { label: "Customers Only", val: "CUSTOMER" },
              { label: "Admins", val: "ADMIN" },
              { label: "Managers", val: "MANAGER" },
            ] as const
          ).map((tab) => {
            const active = roleFilter === tab.val;
            return (
              <button
                key={tab.val}
                onClick={() => {
                  setRoleFilter(tab.val);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-zinc-800/60 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-950/70 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Users Table ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            <span className="text-xs font-medium">Loading registered users...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">User & Contact</th>
                  <th className="py-3 px-3">Role (Change Permission)</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Orders</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((u) => {
                  const isMasterAdmin = u.email === "admin@example.com";
                  const isBusy = updatingUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* User details */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-xs text-amber-400 uppercase shrink-0">
                            {u.name ? u.name.charAt(0) : "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{u.name || "Customer User"}</span>
                              {isMasterAdmin && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  <Crown className="w-2.5 h-2.5" />
                                  Master
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Role Dropdown */}
                      <td className="py-3.5 px-3">
                        {isMasterAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                            <Crown className="w-3 h-3" />
                            ADMIN (Permanent)
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              disabled={isBusy}
                              onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                              className={`px-2.5 py-1 pr-7 rounded-lg text-xs font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                                u.role === "ADMIN"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/60"
                                  : u.role === "MANAGER"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30 hover:border-sky-500/60"
                                  : "bg-zinc-800/80 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                              } ${isBusy ? "opacity-50 cursor-wait" : ""}`}
                            >
                              <option value="CUSTOMER" className="bg-zinc-950 text-emerald-400">
                                CUSTOMER
                              </option>
                              <option value="MANAGER" className="bg-zinc-950 text-sky-400">
                                MANAGER
                              </option>
                              <option value="ADMIN" className="bg-zinc-950 text-amber-400">
                                ADMIN
                              </option>
                            </select>
                            {isBusy && (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 font-mono text-slate-400">
                        {u.phone || "—"}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                          <ShoppingBag className="w-3 h-3 text-amber-400/80" />
                          <span>{u._count?.orders ?? 0}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {formatDate(u.createdAt, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleStatusToggle(u)}
                          disabled={isMasterAdmin || isBusy}
                          title={u.isActive ? "Click to deactivate user" : "Click to activate user"}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                            u.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                          } ${isMasterAdmin ? "cursor-default opacity-80" : ""}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          <span>{u.isActive ? "Active" : "Suspended"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        {!isMasterAdmin && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Users className="w-8 h-8 text-amber-400/50 mx-auto" />
            <p className="font-semibold text-white text-sm">No user accounts found</p>
            <p className="text-slate-500">Try adjusting your role filter or search keywords.</p>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────── */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the user{" "}
              <strong className="text-white">{deletingUser.name || deletingUser.email}</strong>?
              All associated session tokens will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete User</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
