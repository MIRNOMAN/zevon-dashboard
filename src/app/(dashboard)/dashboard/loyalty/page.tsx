"use client";

import React, { useState } from "react";
import {
  Award,
  Gift,
  Users,
  Coins,
  Sparkles,
  TrendingUp,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserCheck,
  Percent,
  Sliders,
  X,
  CreditCard,
  Send,
} from "lucide-react";
import {
  useGetLoyaltyOverviewQuery,
  useGetLoyaltyMembersQuery,
  useAdjustUserPointsMutation,
  useGetAdminGiftCardsQuery,
  useCreateAdminGiftCardMutation,
  type CustomerTier,
  type LoyaltyMemberItem,
} from "@/redux/api/loyaltyApi";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";
import Image from "next/image";

export default function LoyaltyPage() {
  const { format: formatPrice } = useFormatPrice();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"MEMBERS" | "LEDGER" | "GIFTCARDS">("MEMBERS");

  // Filters & Pagination for Members
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerTier | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Queries
  const {
    data: overviewRes,
    isLoading: isLoadingOverview,
    isFetching: isFetchingOverview,
    refetch: refetchOverview,
  } = useGetLoyaltyOverviewQuery();

  const {
    data: membersRes,
    isLoading: isLoadingMembers,
    isFetching: isFetchingMembers,
    refetch: refetchMembers,
  } = useGetLoyaltyMembersQuery({
    page,
    limit: 15,
    tier: tierFilter === "ALL" ? undefined : tierFilter,
    search: searchTerm.trim() || undefined,
  });

  const {
    data: giftCardsRes,
    isLoading: isLoadingGiftCards,
    refetch: refetchGiftCards,
  } = useGetAdminGiftCardsQuery();

  // Mutations
  const [adjustPoints, { isLoading: isAdjusting }] = useAdjustUserPointsMutation();
  const [createGiftCard, { isLoading: isCreatingGiftCard }] = useCreateAdminGiftCardMutation();

  // Modals & Forms State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LoyaltyMemberItem | null>(null);
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<string>("MANUAL_ADJUSTMENT");
  const [adjustReason, setAdjustReason] = useState("");

  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [gcCode, setGcCode] = useState("");
  const [gcAmount, setGcAmount] = useState("");
  const [gcRecipientEmail, setGcRecipientEmail] = useState("");
  const [gcRecipientName, setGcRecipientName] = useState("");
  const [gcMessage, setGcMessage] = useState("");
  const [gcExpiryDays, setGcExpiryDays] = useState("365");

  // Toast / Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const overview = overviewRes?.data;
  const tierStats = overview?.tierStats;
  const pointsStats = overview?.pointsStats;
  const referralStats = overview?.referralStats;
  const members = membersRes?.data?.members || [];
  const pagination = membersRes?.data?.pagination;
  const recentTransactions = overview?.recentTransactions || [];

  // Parse Gift Cards
  const rawGc = giftCardsRes?.data;
  const giftCards = Array.isArray(rawGc)
    ? rawGc
    : (rawGc as { giftCards?: unknown[] })?.giftCards || [];

  const handleOpenAdjust = (member?: LoyaltyMemberItem) => {
    if (member) {
      setSelectedMember(member);
      setAdjustUserId(member.userId);
    } else {
      setSelectedMember(null);
      setAdjustUserId("");
    }
    setAdjustAmount("");
    setAdjustType("MANUAL_ADJUSTMENT");
    setAdjustReason("");
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(adjustAmount, 10);
    if (isNaN(amountNum) || amountNum === 0) {
      showToast("error", "Please enter a valid points amount (positive for credit, negative for debit).");
      return;
    }
    if (!adjustUserId.trim()) {
      showToast("error", "Please specify a customer ID or select a member.");
      return;
    }
    if (!adjustReason.trim()) {
      showToast("error", "Please provide an audit reason for points adjustment.");
      return;
    }

    try {
      await adjustPoints({
        userId: adjustUserId.trim(),
        amount: amountNum,
        reason: adjustReason.trim(),
        type: adjustType,
      }).unwrap();

      showToast(
        "success",
        `Successfully ${amountNum > 0 ? "credited" : "debited"} ${Math.abs(amountNum)} points!`
      );
      setShowAdjustModal(false);
      refetchOverview();
      refetchMembers();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to adjust user points"));
    }
  };

  const handleGiftCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(gcAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("error", "Please enter a valid gift card amount.");
      return;
    }
    if (!gcRecipientEmail.trim()) {
      showToast("error", "Recipient email is required.");
      return;
    }

    try {
      const days = parseInt(gcExpiryDays, 10) || 365;
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      await createGiftCard({
        code: gcCode.trim() || undefined,
        amount: amountNum,
        recipientEmail: gcRecipientEmail.trim(),
        recipientName: gcRecipientName.trim() || undefined,
        customMessage: gcMessage.trim() || undefined,
        expiresAt,
      }).unwrap();

      showToast("success", `Digital Gift Card for ৳${amountNum} issued successfully!`);
      setShowGiftCardModal(false);
      setGcCode("");
      setGcAmount("");
      setGcRecipientEmail("");
      setGcRecipientName("");
      setGcMessage("");
      refetchGiftCards();
    } catch (err) {
      showToast("error", getErrorMessage(err, "Failed to issue gift card"));
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return "text-indigo-300 border-indigo-500/30 bg-indigo-500/10";
      case "GOLD":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "SILVER":
        return "text-slate-200 border-slate-400/30 bg-slate-400/10";
      default:
        return "text-amber-600 border-amber-700/30 bg-amber-700/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Loyalty & Referral Rewards</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure VIP tier thresholds, points accrual, and customer referral rewards
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              refetchOverview();
              refetchMembers();
              refetchGiftCards();
            }}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
            title="Refresh Loyalty Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetchingOverview || isFetchingMembers ? "animate-spin text-amber-400" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenAdjust()}
            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 border border-white/10 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Adjust Points</span>
          </button>

          <button
            onClick={() => setShowGiftCardModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ─────────────────────────────── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Tier Cards Grid (Dynamic API Integration) ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Tier 0: Bronze */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-amber-700/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Base: Bronze Tier
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-700/10 border border-amber-700/30 text-amber-500">
              1.0x Pts
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ৳100 spent = 1 pt • 50 Welcome bonus points
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enrolled Members</span>
            <strong className="text-white font-mono text-xs">
              {isLoadingOverview ? "..." : tierStats?.bronze ?? 0} members
            </strong>
          </div>
        </div>

        {/* Tier 1: Silver */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2 relative overflow-hidden group hover:border-slate-300/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tier 1: Silver Guild
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-400/10 border border-slate-400/30 text-slate-200">
              1.25x Pts
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ৳5,000+ spend • 5% birthday discount
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enrolled Members</span>
            <strong className="text-white font-mono text-xs">
              {isLoadingOverview ? "..." : tierStats?.silver ?? 0} members
            </strong>
          </div>
        </div>

        {/* Tier 2: Gold */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 backdrop-blur-md space-y-2 relative overflow-hidden group shadow-lg shadow-amber-500/5 hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Tier 2: Gold Atelier
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
              1.5x Pts
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ৳20,000+ spend • Free bespoke tailoring & priority drops
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enrolled Members</span>
            <strong className="text-white font-mono text-xs">
              {isLoadingOverview ? "..." : tierStats?.gold ?? 0} members
            </strong>
          </div>
        </div>

        {/* Tier 3: Platinum */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-indigo-500/30 backdrop-blur-md space-y-2 relative overflow-hidden group shadow-lg shadow-indigo-500/5 hover:border-indigo-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Tier 3: Platinum Bespoke
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-bold">
              2.0x Pts
            </span>
          </div>
          <p className="text-xs text-slate-300">
            ৳50,000+ spend • Private concierge styling
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enrolled Members</span>
            <strong className="text-white font-mono text-xs">
              {isLoadingOverview ? "..." : tierStats?.platinum ?? 0} members
            </strong>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Overview ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Total Rewards Members</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white">
            {isLoadingOverview ? "..." : tierStats?.totalMembers ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Points in Circulation</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{isLoadingOverview ? "..." : (pointsStats?.pointsInCirculation ?? 0).toLocaleString()} pts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Lifetime Points Issued</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white">
            {isLoadingOverview ? "..." : (pointsStats?.lifetimePointsIssued ?? 0).toLocaleString()} pts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Referral Bonuses Distributed</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
            ৳{isLoadingOverview ? "..." : (referralStats?.totalRewardsBDT ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("MEMBERS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "MEMBERS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Loyalty Members Directory</span>
        </button>

        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "LEDGER"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Points Ledger / Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab("GIFTCARDS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "GIFTCARDS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-zinc-900"
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Digital Gift Cards ({giftCards.length})</span>
        </button>
      </div>

      {/* ── Tab 1: Loyalty Members Directory ─────────────────── */}
      {activeTab === "MEMBERS" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search member by name or email..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-zinc-950 rounded-xl border border-white/10 text-xs">
              {(["ALL", "BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    setTierFilter(tier);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    tierFilter === tier
                      ? "bg-amber-500 text-black font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tier === "ALL" ? "All Tiers" : tier}
                </button>
              ))}
            </div>
          </div>

          {/* Members Table */}
          {isLoadingMembers ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-zinc-900/40 rounded-2xl border border-white/10">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-medium">Fetching loyalty accounts from server...</span>
            </div>
          ) : members.length > 0 ? (
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/60 backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-zinc-950/80 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Current Tier</th>
                      <th className="py-3 px-4">Points Balance</th>
                      <th className="py-3 px-4">Lifetime Points</th>
                      <th className="py-3 px-4">Lifetime Spend</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold flex items-center justify-center text-xs shrink-0 relative overflow-hidden">
                              {member.avatarUrl ? (
                                <Image
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <span>{member.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{member.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTierColor(
                              member.tier
                            )}`}
                          >
                            {member.tier}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {member.pointsBalance.toLocaleString()} pts
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {member.lifetimePointsEarned.toLocaleString()} pts
                        </td>

                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {formatPrice(member.lifetimeSpent)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(member)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-slate-300 text-[11px] font-medium transition-all"
                          >
                            Adjust Points
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-3 bg-zinc-950/60 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total members)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-zinc-900/40 rounded-2xl border border-white/10 space-y-2">
              <Users className="w-8 h-8 mx-auto text-amber-400/60" />
              <p className="text-sm font-semibold text-white">No loyalty members found</p>
              <p className="text-xs text-slate-500">
                {searchTerm ? "Try refining your search query." : "Members will automatically enroll upon registration."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Points Ledger & Audit Log ──────────────────── */}
      {activeTab === "LEDGER" && (
        <div className="space-y-4">
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/60 backdrop-blur-md">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Recent Points Transactions & Audit Ledger</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Live Real-Time Stream</span>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentTransactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{tx.userName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-zinc-800 text-slate-400 border border-white/5 uppercase">
                              {tx.type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{tx.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-mono font-bold text-sm ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? `+${tx.amount}` : tx.amount} pts
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-500 text-xs">
                No point transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: Digital Gift Cards ─────────────────────────── */}
      {activeTab === "GIFTCARDS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Digital Gift Cards & Vouchers</span>
            </h3>

            <button
              onClick={() => setShowGiftCardModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Gift Card</span>
            </button>
          </div>

          {isLoadingGiftCards ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-zinc-900/40 rounded-2xl border border-white/10">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Loading gift vouchers...</span>
            </div>
          ) : giftCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {giftCards.map((gc: any) => (
                <div
                  key={gc.id}
                  className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 tracking-wider">
                      {gc.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        gc.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-slate-400"
                      }`}
                    >
                      {gc.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xl font-bold font-mono text-white">
                      ৳{Number(gc.currentBalance).toLocaleString()}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        / ৳{Number(gc.initialBalance).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Recipient: <strong className="text-white">{gc.recipientEmail}</strong>
                    </p>
                  </div>

                  {gc.customMessage && (
                    <p className="text-[11px] text-slate-400 italic bg-zinc-950/60 p-2 rounded-lg border border-white/5 line-clamp-2">
                      &quot;{gc.customMessage}&quot;
                    </p>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Issued: {new Date(gc.createdAt).toLocaleDateString()}</span>
                    <span>{gc.expiresAt ? `Exp: ${new Date(gc.expiresAt).toLocaleDateString()}` : "No Expiry"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-zinc-900/40 rounded-2xl border border-white/10 space-y-2">
              <Gift className="w-8 h-8 mx-auto text-amber-400/60" />
              <p className="text-sm font-semibold text-white">No digital gift cards created yet</p>
              <button
                onClick={() => setShowGiftCardModal(true)}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue First Card</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal: Adjust User Points ─────────────────────────── */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>
                  {selectedMember ? `Adjust Points (${selectedMember.name})` : "Adjust Customer Loyalty Points"}
                </span>
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5">
              {!selectedMember && (
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Customer User ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustUserId}
                    onChange={(e) => setAdjustUserId(e.target.value)}
                    placeholder="e.g. user-cuid"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Points Amount (+ Credit or - Debit) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 100 for credit, -50 for debit"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Positive values add reward points, negative values deduct points.
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Transaction Type
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="MANUAL_ADJUSTMENT">Manual Admin Adjustment</option>
                  <option value="WELCOME_BONUS">Welcome Bonus</option>
                  <option value="REFERRAL_BONUS">Referral Reward Bonus</option>
                  <option value="REFUND_REVERSAL">Refund Reversal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Audit Reason / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Compensation for order delay / Special VIP perk"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {isAdjusting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Points Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Issue Digital Gift Card ───────────────────── */}
      {showGiftCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Issue Digital Gift Card</span>
              </h3>
              <button
                onClick={() => setShowGiftCardModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGiftCardSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Card Amount (৳ BDT) *
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={gcAmount}
                  onChange={(e) => setGcAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={gcRecipientEmail}
                  onChange={(e) => setGcRecipientEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={gcRecipientName}
                  onChange={(e) => setGcRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Custom Voucher Code (Optional, leave blank for auto-generate)
                </label>
                <input
                  type="text"
                  value={gcCode}
                  onChange={(e) => setGcCode(e.target.value)}
                  placeholder="e.g. ZEVON-VIP-2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Personalized Gift Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={gcMessage}
                  onChange={(e) => setGcMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday! Enjoy shopping luxury streetwear with ZEVON."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowGiftCardModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGiftCard}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  {isCreatingGiftCard && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Issue & Send Gift Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
