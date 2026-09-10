"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Send,
  Loader2,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Zap,
  Tag,
  Search,
  Package,
  Sparkles,
  Inbox,
  Calendar,
} from "lucide-react";
import {
  useGetAbandonedCartsQuery,
  useTriggerAbandonedRecoveryMutation,
  type AbandonedCartItem,
} from "@/redux/api/dashboardApi";

export default function AbandonedCartsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SENT">("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // RTK Query & Mutation
  const { data: res, isLoading, isFetching, refetch } = useGetAbandonedCartsQuery();
  const [triggerRecovery, { isLoading: isTriggering }] = useTriggerAbandonedRecoveryMutation();

  const rawData = res?.data;
  const cartsList: AbandonedCartItem[] = useMemo(() => {
    if (rawData && "carts" in rawData && Array.isArray(rawData.carts)) {
      return rawData.carts;
    }
    return [];
  }, [rawData]);

  const totalAbandoned = rawData?.totalAbandoned ?? cartsList.length;

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setFeedbackMessage({ type, message });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Trigger Recovery Scan (Dispatches dynamic 10% coupon emails)
  const handleTriggerRecovery = async () => {
    try {
      const response = await triggerRecovery().unwrap();
      const payload = response.data;
      const count = payload?.dispatchedRecoveryEmails ?? 0;
      const scanned = payload?.scannedCartsCount ?? 0;
      showNotification(
        `Automated recovery scan complete! Scanned ${scanned} cart(s), dispatched ${count} personalized recovery email(s) with 10% discount codes.`,
        "success"
      );
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to trigger abandoned cart recovery scan.";
      showNotification(errorMsg, "error");
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const pending = cartsList.filter((c) => !c.abandonedEmailSentAt || c.abandonedEmailCount === 0).length;
    const sent = cartsList.filter((c) => c.abandonedEmailCount > 0).length;
    const totalItems = cartsList.reduce((acc, c) => acc + (c.itemsCount || 0), 0);
    return { pending, sent, totalItems };
  }, [cartsList]);

  // Filtered List
  const filteredCarts = useMemo(() => {
    return cartsList.filter((cart) => {
      // Status Filter
      if (statusFilter === "PENDING" && cart.abandonedEmailCount > 0) return false;
      if (statusFilter === "SENT" && cart.abandonedEmailCount === 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const userName = cart.user?.name?.toLowerCase() || "";
        const userEmail = cart.user?.email?.toLowerCase() || "";
        const userPhone = cart.user?.phone?.toLowerCase() || "";
        const cartId = cart.id.toLowerCase();
        return (
          userName.includes(query) ||
          userEmail.includes(query) ||
          userPhone.includes(query) ||
          cartId.includes(query)
        );
      }
      return true;
    });
  }, [cartsList, statusFilter, searchQuery]);

  // Format relative time helper
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Conversion Automation
            </span>
            <span className="text-xs text-zinc-500">Cart Recovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-amber-400" />
            <span>Abandoned Cart Recovery</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Automated recovery emails, dynamic 10% promo discounts, and high-intent customer re-engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleTriggerRecovery}
            disabled={isTriggering}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            {isTriggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-zinc-950" />
            )}
            <span>Trigger Recovery Scan</span>
          </button>
        </div>
      </div>

      {/* ── Feedback / Notification Banner ─────────────────────── */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{feedbackMessage.message}</span>
        </div>
      )}

      {/* ── KPI Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Abandoned */}
        <div className="rounded-2xl p-4.5 bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Total Abandoned Carts</span>
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{totalAbandoned}</div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1 font-medium">
            <span>Carts inactive &gt; 2 hours</span>
          </div>
        </div>

        {/* Pending Follow-up */}
        <div
          onClick={() => setStatusFilter("PENDING")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            statusFilter === "PENDING"
              ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Pending Reminder</span>
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.pending}</div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>Awaiting first recovery email</span>
          </div>
        </div>

        {/* Dispatched Follow-up */}
        <div
          onClick={() => setStatusFilter("SENT")}
          className={`cursor-pointer rounded-2xl p-4.5 border transition-all duration-200 ${
            statusFilter === "SENT"
              ? "bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/30"
              : "bg-zinc-900/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/80"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Reminders Dispatched</span>
            <span className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400">
              <Mail className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{kpis.sent}</div>
          <div className="text-[11px] text-sky-400/80 mt-1 flex items-center gap-1 font-medium">
            <span>1+ recovery emails sent</span>
          </div>
        </div>

        {/* Automation Promo Incentive */}
        <div className="rounded-2xl p-4.5 bg-gradient-to-br from-amber-500/10 via-zinc-900/80 to-zinc-900/60 border border-amber-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Recovery Strategy</span>
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-2">10% Off Promo</div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Auto-generated single-use coupons</span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/50 p-3.5 rounded-2xl border border-white/10">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or cart ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/80 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: `All Carts (${totalAbandoned})` },
            { id: "PENDING", label: `Pending (${kpis.pending})` },
            { id: "SENT", label: `Reminders Sent (${kpis.sent})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as "ALL" | "PENDING" | "SENT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-amber-400 text-zinc-950 font-semibold shadow-md shadow-amber-400/10"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Abandoned Carts Table ─────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden backdrop-blur-md">
        {isLoading ? (
          <div className="py-20 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <div className="text-sm font-medium text-white">Scanning Abandoned Carts</div>
            <p className="text-xs text-zinc-500">Querying active shopping sessions from database...</p>
          </div>
        ) : filteredCarts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-zinc-950/40 text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Cart Items</th>
                  <th className="py-3.5 px-4">Abandoned Since</th>
                  <th className="py-3.5 px-4">Recovery Status</th>
                  <th className="py-3.5 px-4">Last Dispatched</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {filteredCarts.map((cart) => {
                  const hasEmailSent = cart.abandonedEmailCount > 0;

                  return (
                    <tr
                      key={cart.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{cart.user?.name || "Guest Customer"}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {cart.user?.email || "No email available"}
                        </div>
                        {cart.user?.phone && (
                          <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                            {cart.user.phone}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-zinc-600 mt-1">
                          ID: {cart.id.slice(0, 8)}
                        </div>
                      </td>

                      {/* Items in Cart */}
                      <td className="py-4 px-4 align-top">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-200 font-medium">
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>{cart.itemsCount} {cart.itemsCount === 1 ? "Item" : "Items"}</span>
                        </div>
                      </td>

                      {/* Abandoned Date */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{formatTimeAgo(cart.lastActiveAt)}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>
                            {new Date(cart.lastActiveAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Recovery Status */}
                      <td className="py-4 px-4 align-top">
                        {hasEmailSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <Mail className="w-3 h-3" />
                            EMAIL {cart.abandonedEmailCount} SENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            PENDING REMINDER
                          </span>
                        )}
                      </td>

                      {/* Last Dispatched */}
                      <td className="py-4 px-4 align-top text-zinc-400 text-xs">
                        {cart.abandonedEmailSentAt ? (
                          <div>
                            <div className="text-zinc-300 font-medium">
                              {formatTimeAgo(cart.abandonedEmailSentAt)}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {new Date(cart.abandonedEmailSentAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic text-[11px]">Not sent yet</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 align-top text-right">
                        <button
                          onClick={handleTriggerRecovery}
                          disabled={isTriggering}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          {isTriggering ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Send Reminder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-amber-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white">No Abandoned Carts Found</div>
            <p className="text-xs text-zinc-500 max-w-sm">
              {searchQuery || statusFilter !== "ALL"
                ? "No abandoned carts matched your current filter. Try clearing the search query."
                : "Active customer shopping sessions that are abandoned for more than 2 hours will automatically appear here for email recovery follow-up."}
            </p>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="mt-1 px-3.5 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-xs font-semibold transition-colors border border-amber-400/20"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
