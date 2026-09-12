"use client";

import React, { useState, useMemo } from "react";
import {
  Gift,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Power,
  Edit2,
  Eye,
  Copy,
  Check,
  Clock,
  Mail,
  User,
  Sparkles,
  DollarSign,
  TrendingUp,
  X,
  RefreshCw,
  Receipt,
  ArrowRight,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  useGetGiftCardsQuery,
  useGetGiftCardByIdQuery,
  useIssueGiftCardMutation,
  useUpdateGiftCardMutation,
  useToggleGiftCardStatusMutation,
  useDeleteGiftCardMutation,
  type GiftCardItem,
  type GiftCardStatus,
  type CreateGiftCardInput,
  type UpdateGiftCardInput,
} from "@/redux/api/dashboardApi";
import { formatDate, getErrorMessage } from "@/lib/utils";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function GiftCardsPage() {
  const { format: formatCurrency, symbol, activeCurrency } = useFormatPrice();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<GiftCardStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Copied indicator state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal States
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCardItem | null>(null);
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<GiftCardItem | null>(null);

  // Form States for Issue / Create
  const [issueForm, setIssueForm] = useState<{
    amount: number | string;
    recipientEmail: string;
    recipientName: string;
    code: string;
    customMessage: string;
    expiresInMonths: string;
    sendEmail: boolean;
  }>({
    amount: 1000,
    recipientEmail: "",
    recipientName: "",
    code: "",
    customMessage: "",
    expiresInMonths: "12",
    sendEmail: true,
  });

  // Form States for Edit
  const [editForm, setEditForm] = useState<{
    code: string;
    initialBalance: number | string;
    currentBalance: number | string;
    recipientEmail: string;
    recipientName: string;
    customMessage: string;
    status: GiftCardStatus;
    expiresAt: string;
  }>({
    code: "",
    initialBalance: 0,
    currentBalance: 0,
    recipientEmail: "",
    recipientName: "",
    customMessage: "",
    status: "ACTIVE",
    expiresAt: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Queries & Mutations
  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetGiftCardsQuery({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchTerm.trim() ? searchTerm.trim() : undefined,
  });

  const {
    data: viewingCardRes,
    isLoading: isViewingLoading,
  } = useGetGiftCardByIdQuery(viewingCardId || "", {
    skip: !viewingCardId,
  });

  const [issueGiftCard, { isLoading: isIssuing }] = useIssueGiftCardMutation();
  const [updateGiftCard, { isLoading: isUpdating }] = useUpdateGiftCardMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleGiftCardStatusMutation();
  const [deleteGiftCard, { isLoading: isDeleting }] = useDeleteGiftCardMutation();

  const giftCards: GiftCardItem[] = res?.data?.giftCards || [];
  const meta = res?.data?.meta || { total: 0, page: 1, limit: 12, totalPages: 1 };

  // Calculate high-level summary metrics
  const stats = useMemo(() => {
    const totalIssued = giftCards.reduce((acc, c) => acc + (Number(c.initialBalance) || 0), 0);
    const activeBalance = giftCards
      .filter((c) => c.status === "ACTIVE")
      .reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
    const redeemedAmount = giftCards.reduce(
      (acc, c) => acc + (Math.max(0, (Number(c.initialBalance) || 0) - (Number(c.currentBalance) || 0))),
      0
    );
    const activeCards = giftCards.filter((c) => c.status === "ACTIVE").length;

    return {
      totalIssued,
      activeBalance,
      redeemedAmount,
      activeCards,
    };
  }, [giftCards]);

  // Handle Copy to Clipboard
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate a random code for Issue form
  const handleGenerateCode = () => {
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    setIssueForm((prev) => ({ ...prev, code: `ZEV-GIFT-${p1}-${p2}` }));
  };

  // Open Issue Modal
  const openIssueModal = () => {
    const p1 = Math.floor(1000 + Math.random() * 9000);
    const p2 = Math.floor(1000 + Math.random() * 9000);
    setIssueForm({
      amount: 1000,
      recipientEmail: "",
      recipientName: "",
      code: `ZEV-GIFT-${p1}-${p2}`,
      customMessage: "Enjoy your luxury shopping experience at ZEVON!",
      expiresInMonths: "12",
      sendEmail: true,
    });
    setFormError(null);
    setIsIssueModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (card: GiftCardItem) => {
    setEditingCard(card);
    setEditForm({
      code: card.code,
      initialBalance: card.initialBalance,
      currentBalance: card.currentBalance,
      recipientEmail: card.recipientEmail,
      recipientName: card.recipientName || "",
      customMessage: card.customMessage || "",
      status: card.status,
      expiresAt: card.expiresAt ? card.expiresAt.substring(0, 10) : "",
    });
    setFormError(null);
  };

  // Submit Issue
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amountNum = Number(issueForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError("Please provide a valid gift card amount (greater than 0).");
      return;
    }
    if (!issueForm.recipientEmail.trim()) {
      setFormError("Recipient email address is required.");
      return;
    }

    let expiresAt: string | undefined = undefined;
    if (issueForm.expiresInMonths !== "never") {
      const months = parseInt(issueForm.expiresInMonths, 10);
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + months);
      expiresAt = expDate.toISOString();
    }

    const payload: CreateGiftCardInput = {
      amount: amountNum,
      recipientEmail: issueForm.recipientEmail.trim(),
      recipientName: issueForm.recipientName.trim() || undefined,
      code: issueForm.code.trim() || undefined,
      customMessage: issueForm.customMessage.trim() || undefined,
      expiresAt,
      sendEmail: issueForm.sendEmail,
      status: "ACTIVE",
    };

    try {
      await issueGiftCard(payload).unwrap();
      setIsIssueModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to issue gift card."));
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    setFormError(null);

    const initBal = Number(editForm.initialBalance);
    const currBal = Number(editForm.currentBalance);

    if (isNaN(initBal) || initBal < 0 || isNaN(currBal) || currBal < 0) {
      setFormError("Balances must be valid positive numbers.");
      return;
    }

    const payload: UpdateGiftCardInput = {
      code: editForm.code.trim() || undefined,
      initialBalance: initBal,
      currentBalance: currBal,
      recipientEmail: editForm.recipientEmail.trim() || undefined,
      recipientName: editForm.recipientName.trim() || undefined,
      customMessage: editForm.customMessage.trim() || undefined,
      status: editForm.status,
      expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : undefined,
    };

    try {
      await updateGiftCard({ id: editingCard.id, data: payload }).unwrap();
      setEditingCard(null);
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to update gift card."));
    }
  };

  // Handle Quick Toggle Status
  const handleToggle = async (card: GiftCardItem) => {
    try {
      await toggleStatus(card.id).unwrap();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to toggle status"));
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingCard) return;
    try {
      await deleteGiftCard(deletingCard.id).unwrap();
      setDeletingCard(null);
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete gift card"));
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Gift className="w-6 h-6" />
            </span>
            <span>Digital Gift Cards</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Issue, track, and manage luxury store vouchers, balances, and digital redemptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            onClick={openIssueModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      {/* ── Key Metrics Overview ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Balance</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(stats.activeBalance)}
          </div>
          <p className="text-[11px] text-emerald-400/90 font-medium">
            Ready for customer redemption
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Issued</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(stats.totalIssued)}
          </div>
          <p className="text-[11px] text-slate-400">
            Cumulative issued face value
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Redeemed Volume</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {formatCurrency(stats.redeemedAmount)}
          </div>
          <p className="text-[11px] text-sky-400/90">
            Claimed on completed checkouts
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Cards</span>
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.activeCards}
          </div>
          <p className="text-[11px] text-slate-400">
            Currently valid vouchers
          </p>
        </div>
      </div>

      {/* ── Filters & Search Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3 rounded-2xl bg-zinc-900/40 border border-white/10 backdrop-blur-md">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { label: "All Cards", val: "ALL" },
              { label: "Active", val: "ACTIVE" },
              { label: "Redeemed", val: "REDEEMED" },
              { label: "Expired", val: "EXPIRED" },
              { label: "Disabled", val: "DISABLED" },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.val;
            return (
              <button
                key={tab.val}
                onClick={() => {
                  setStatusFilter(tab.val);
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

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, email, or recipient..."
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

      {/* ── Cards Grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-16 rounded-2xl bg-zinc-900/30 border border-white/5 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Loading digital gift cards...</span>
        </div>
      ) : giftCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {giftCards.map((card) => {
            const initialBal = Number(card.initialBalance) || 0;
            const currentBal = Number(card.currentBalance) || 0;
            const isExpired = card.expiresAt ? new Date() > new Date(card.expiresAt) : false;
            const isFullyRedeemed = currentBal === 0;
            const remainingPct = initialBal > 0 ? (currentBal / initialBal) * 100 : 0;

            const statusColors: Record<GiftCardStatus, { badge: string; dot: string }> = {
              ACTIVE: {
                badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                dot: "bg-emerald-400 animate-pulse",
              },
              REDEEMED: {
                badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                dot: "bg-sky-400",
              },
              EXPIRED: {
                badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                dot: "bg-rose-400",
              },
              DISABLED: {
                badge: "bg-zinc-800 text-slate-400 border-white/5",
                dot: "bg-zinc-600",
              },
            };

            const statusInfo = statusColors[card.status] || statusColors.ACTIVE;

            return (
              <div
                key={card.id}
                className="group relative rounded-2xl bg-zinc-900/70 border border-white/10 hover:border-amber-500/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                {/* Gold Card Top Edge Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-500/50 via-yellow-400 to-amber-500/50 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="p-5 space-y-4">
                  {/* Voucher Header: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                      <button
                        onClick={() => handleCopy(card.code)}
                        title="Click to copy voucher code"
                        className="font-mono font-bold text-xs sm:text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{card.code}</span>
                        {copiedCode === card.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500 group-hover:text-amber-400/70 shrink-0" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.badge}`}
                    >
                      {card.status}
                    </span>
                  </div>

                  {/* Balance Display */}
                  <div className="space-y-1.5 p-3.5 rounded-xl bg-zinc-950/60 border border-white/5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Remaining Balance</span>
                      <span className="text-base sm:text-lg font-black text-white font-mono">
                        {formatCurrency(currentBal)}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentBal === 0
                            ? "bg-zinc-700"
                            : "bg-gradient-to-r from-amber-500 to-yellow-400"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, remainingPct))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Initial: {formatCurrency(initialBal)}</span>
                      <span>{Math.round(remainingPct)}% left</span>
                    </div>
                  </div>

                  {/* Recipient & Sender Info */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span className="truncate text-white font-medium">
                        {card.recipientEmail}
                      </span>
                    </div>

                    {card.recipientName && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-slate-300">
                          {card.recipientName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expiry Meta */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {card.expiresAt
                          ? `Expires: ${formatDate(card.expiresAt, { month: "short", day: "numeric", year: "numeric" })}`
                          : "No Expiration"}
                      </span>
                    </span>

                    {isExpired && card.status === "ACTIVE" && (
                      <span className="text-rose-400 text-[10px] font-bold">EXPIRED</span>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-zinc-950/60 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setViewingCardId(card.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Redemptions</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(card)}
                      title="Edit Gift Card"
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggle(card)}
                      disabled={isToggling}
                      title={card.status === "ACTIVE" ? "Disable Gift Card" : "Enable Gift Card"}
                      className={`p-1.5 rounded-lg transition-all ${
                        card.status === "ACTIVE"
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800/80 hover:bg-zinc-700 text-slate-400"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingCard(card)}
                      title="Delete Gift Card"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ──────────────────────────────────────── */
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No digital gift cards found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Issue your first branded gift voucher to send store credit to customers or VIPs.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={openIssueModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs flex items-center gap-1.5 mx-auto shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue First Gift Card</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-400">
          <span>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} gift cards
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-50 text-white"
            >
              Previous
            </button>
            <span className="font-mono text-white px-2">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-50 text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── ISSUE / CREATE GIFT CARD MODAL ────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Gift className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Issue Digital Gift Card</h3>
                  <p className="text-xs text-slate-400">Generate a branded voucher code & credit</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              {/* Amount & Preset Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Voucher Value / Amount ({symbol} {activeCurrency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={issueForm.amount}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="1000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[50, 100, 250, 500, 1000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setIssueForm((prev) => ({ ...prev, amount: amt }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        Number(issueForm.amount) === amt
                          ? "bg-amber-500 text-black font-bold"
                          : "bg-zinc-800 text-slate-300 hover:bg-zinc-700"
                      }`}
                    >
                      {symbol}{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voucher Code (with random generator) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Voucher Code (Optional Custom Code)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={issueForm.code}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="ZEV-GIFT-XXXX-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={issueForm.recipientEmail}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, recipientEmail: e.target.value }))
                    }
                    placeholder="friend@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Recipient Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={issueForm.recipientName}
                    onChange={(e) =>
                      setIssueForm((prev) => ({ ...prev, recipientName: e.target.value }))
                    }
                    placeholder="Tahmid Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Personalized Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Personalized Greeting Message
                </label>
                <textarea
                  rows={2}
                  value={issueForm.customMessage}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, customMessage: e.target.value }))
                  }
                  placeholder="Happy Birthday! Enjoy your shopping experience."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* Expiry Period */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Voucher Validity Duration
                </label>
                <select
                  value={issueForm.expiresInMonths}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, expiresInMonths: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                >
                  <option value="6">6 Months</option>
                  <option value="12">1 Year (Standard)</option>
                  <option value="24">2 Years</option>
                  <option value="never">No Expiration (Lifetime)</option>
                </select>
              </div>

              {/* Send Email Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="sendEmailCheck"
                  checked={issueForm.sendEmail}
                  onChange={(e) =>
                    setIssueForm((prev) => ({ ...prev, sendEmail: e.target.checked }))
                  }
                  className="w-4 h-4 rounded bg-zinc-950 border-white/10 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="sendEmailCheck" className="text-xs text-slate-300 cursor-pointer">
                  Send email delivery notification to recipient immediately
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIssuing}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isIssuing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Issuing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Issue Gift Card</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── EDIT GIFT CARD MODAL ──────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Edit2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Gift Card</h3>
                  <p className="text-xs text-slate-400">Update code, balances, recipient, or status</p>
                </div>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Voucher Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Card Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value as GiftCardStatus,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                    <option value="REDEEMED">REDEEMED</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>

              {/* Balances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Remaining Balance ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editForm.currentBalance}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, currentBalance: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Initial Balance ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editForm.initialBalance}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, initialBalance: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-slate-400 font-mono text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Recipient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Recipient Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.recipientEmail}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, recipientEmail: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Recipient Name</label>
                  <input
                    type="text"
                    value={editForm.recipientName}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, recipientName: e.target.value }))
                    }
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Expiration Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={editForm.expiresAt}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Greeting Note</label>
                <textarea
                  rows={2}
                  value={editForm.customMessage}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, customMessage: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── VIEW CARD DETAILS & REDEMPTIONS LOGS MODAL ────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {viewingCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Gift className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Gift Card Overview & Redemptions</h3>
                  <p className="text-xs text-slate-400">Detailed transaction ledger & voucher validity</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCardId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isViewingLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Fetching redemption ledger...</span>
              </div>
            ) : viewingCardRes?.data ? (
              (() => {
                const c = viewingCardRes.data;
                const redemptions = c.redemptions || [];
                return (
                  <div className="space-y-5">
                    {/* Visual Luxury Digital Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 border border-amber-500/30 p-5 sm:p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                          ZEVON LUXURY GIFT CARD
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-800 text-slate-400 border-white/10"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400">Voucher Code</span>
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                              {c.code}
                            </span>
                            <button
                              onClick={() => handleCopy(c.code)}
                              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                            >
                              {copiedCode === c.code ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[11px] text-slate-400 block">Available Balance</span>
                          <span className="text-2xl font-black text-white">
                            {formatCurrency(c.currentBalance)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                        <span>
                          Recipient: <strong className="text-white">{c.recipientEmail}</strong>{" "}
                          {c.recipientName ? `(${c.recipientName})` : ""}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {c.expiresAt
                            ? `Expires: ${formatDate(c.expiresAt, { month: "short", day: "numeric", year: "numeric" })}`
                            : "Lifetime Validity"}
                        </span>
                      </div>
                    </div>

                    {/* Greeting Message if any */}
                    {c.customMessage && (
                      <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 text-xs">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                          Sender Note:
                        </span>
                        <p className="text-slate-300 italic">"{c.customMessage}"</p>
                      </div>
                    )}

                    {/* Redemptions History Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-amber-400" />
                        <span>Redemption Transactions ({redemptions.length})</span>
                      </h4>

                      {redemptions.length > 0 ? (
                        <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-zinc-950/60 max-h-56 overflow-y-auto">
                          {redemptions.map((r) => (
                            <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium">
                                    {r.user?.name || r.user?.email || "Customer Checkout"}
                                  </span>
                                  {r.orderId && (
                                    <span className="text-[10px] font-mono text-slate-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                                      Order #{r.orderId.substring(0, 8)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {new Date(r.createdAt).toLocaleString()}
                                </span>
                              </div>

                              <div className="text-right font-mono">
                                <span className="text-rose-400 font-bold block text-xs">
                                  -{formatCurrency(r.amountDeducted)}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Balance: {formatCurrency(r.balanceAfter)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 bg-zinc-950/40 rounded-xl border border-white/5">
                          No redemption transactions yet for this card.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          setViewingCardId(null);
                          openEditModal(c);
                        }}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Card</span>
                      </button>

                      <button
                        onClick={() => setViewingCardId(null)}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {deletingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Delete Gift Card</h3>
                <p className="text-xs text-slate-400 font-mono">{deletingCard.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete gift card{" "}
              <strong className="text-white font-mono">{deletingCard.code}</strong> issued to{" "}
              <strong className="text-white">{deletingCard.recipientEmail}</strong> with balance{" "}
              <strong className="text-amber-400">{formatCurrency(deletingCard.currentBalance)}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                onClick={() => setDeletingCard(null)}
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
                  <span>Delete Forever</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
