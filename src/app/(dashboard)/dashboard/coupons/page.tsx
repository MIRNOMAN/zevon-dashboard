"use client";

import React, { useState, useMemo } from "react";
import {
  TicketPercent,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Power,
  Calendar,
  DollarSign,
  Users,
  Search,
  Copy,
  Check,
  Edit2,
  X,
  Sparkles,
} from "lucide-react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
  type CouponItem,
  type DiscountType,
} from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function CouponsPage() {
  const { format: formatCurrency, symbol } = useFormatPrice();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetCouponsQuery(
    {
      search: searchTerm.trim() || undefined,
      isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();
  const [toggleCouponStatus, { isLoading: isToggling }] = useToggleCouponStatusMutation();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Feedback & Copy State
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const rawData = res?.data;
  let coupons: CouponItem[] = [];
  if (Array.isArray(rawData)) {
    coupons = rawData;
  } else if (rawData && "coupons" in rawData && Array.isArray(rawData.coupons)) {
    coupons = rawData.coupons;
  }

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinOrderAmount("");
    setMaxDiscountAmount("");
    setStartDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setEndDate(d.toISOString().split("T")[0]);
    setUsageLimit("");
    setPerUserLimit("1");
    setDescription("");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMinOrderAmount(coupon.minOrderAmount ? String(coupon.minOrderAmount) : "");
    setMaxDiscountAmount(coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : "");
    setStartDate(
      coupon.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setEndDate(
      coupon.endDate
        ? new Date(coupon.endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
    setPerUserLimit(coupon.perUserLimit ? String(coupon.perUserLimit) : "1");
    setDescription(coupon.description || "");
    setIsActive(coupon.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      showFeedback("error", "Coupon code and discount value are required.");
      return;
    }

    const startIso = new Date(startDate + "T00:00:00.000Z").toISOString();
    const endIso = new Date(endDate + "T23:59:59.000Z").toISOString();

    if (new Date(startIso) >= new Date(endIso)) {
      showFeedback("error", "End date must be after start date.");
      return;
    }

    try {
      if (editingCoupon) {
        await updateCoupon({
          id: editingCoupon.id,
          data: {
            code: code.trim().toUpperCase(),
            discountType,
            discountValue: parseFloat(discountValue),
            minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
            maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
            startDate: startIso,
            endDate: endIso,
            usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
            perUserLimit: perUserLimit ? parseInt(perUserLimit, 10) : 1,
            description: description.trim() || undefined,
            isActive,
          },
        }).unwrap();
        showFeedback("success", `Coupon "${code.toUpperCase()}" updated successfully!`);
      } else {
        await createCoupon({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
          maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
          startDate: startIso,
          endDate: endIso,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
          perUserLimit: perUserLimit ? parseInt(perUserLimit, 10) : 1,
          description: description.trim() || undefined,
          isActive,
        }).unwrap();
        showFeedback("success", `Coupon "${code.toUpperCase()}" created successfully!`);
      }

      setShowModal(false);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        (Array.isArray(err?.data?.message) ? err?.data?.message.join(", ") : null) ||
        err?.message ||
        "Failed to save coupon. Please verify backend requirements.";
      showFeedback("error", typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleToggle = async (coupon: CouponItem) => {
    try {
      setActionInProgressId(coupon.id);
      await toggleCouponStatus(coupon.id).unwrap();
      showFeedback(
        "success",
        `Coupon "${coupon.code}" is now ${!coupon.isActive ? "Active" : "Disabled"}.`
      );
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to toggle status";
      showFeedback("error", msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (coupon: CouponItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      setActionInProgressId(coupon.id);
      await deleteCoupon(coupon.id).unwrap();
      showFeedback("success", `Coupon "${coupon.code}" deleted successfully.`);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to delete coupon";
      showFeedback("error", msg);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSeedQuickPromo = async (sampleCode: string, val: number, type: DiscountType) => {
    try {
      const start = new Date().toISOString();
      const end = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      await createCoupon({
        code: sampleCode,
        discountType: type,
        discountValue: val,
        minOrderAmount: type === "PERCENTAGE" ? 1000 : 500,
        maxDiscountAmount: type === "PERCENTAGE" ? 500 : undefined,
        startDate: start,
        endDate: end,
        usageLimit: 500,
        perUserLimit: 1,
        description: `Official promo coupon: ${val}${type === "PERCENTAGE" ? "%" : "৳"} off eligible store orders`,
        isActive: true,
      }).unwrap();
      showFeedback("success", `Quick promo "${sampleCode}" created!`);
    } catch (err: any) {
      showFeedback("error", err?.data?.message || "Failed to create quick promo");
    }
  };

  const activeCount = useMemo(() => coupons.filter((c) => c.isActive).length, [coupons]);
  const totalRedeemed = useMemo(
    () => coupons.reduce((acc, c) => acc + (c.usedCount || c.usageCount || 0), 0),
    [coupons]
  );

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TicketPercent className="w-6 h-6 text-amber-400" />
            <span>Coupons & Promotions</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live promotions from <code className="text-amber-300 font-mono text-xs">/coupons</code> ({coupons.length} vouchers, {activeCount} active, {totalRedeemed} total redemptions)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* ── Feedback Banner ───────────────────────────────────── */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Search & Filter Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon code or description..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Status:
          </span>
          <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-white/10 text-xs">
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? "bg-amber-500 text-black font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Disabled"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Coupons List / Grid ───────────────────────────────── */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-zinc-900/40 rounded-2xl border border-white/10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Fetching real coupons from backend...</span>
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const isPercentage = c.discountType === "PERCENTAGE";
            const valNum = Number(c.discountValue);
            const minSpend = c.minOrderAmount ? Number(c.minOrderAmount) : null;
            const maxCap = c.maxDiscountAmount ? Number(c.maxDiscountAmount) : null;
            const used = c.usedCount ?? c.usageCount ?? 0;
            const limit = c.usageLimit;
            const isProcessing = actionInProgressId === c.id;

            const isExpired = c.endDate && new Date(c.endDate) < new Date();

            return (
              <div
                key={c.id}
                className={`group relative p-5 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between ${
                  c.isActive && !isExpired
                    ? "bg-zinc-900/70 border-white/10 hover:border-amber-500/40"
                    : "bg-zinc-950/60 border-white/5 opacity-75"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Code + Discount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(c.code)}
                        title="Click to copy code"
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-amber-400 text-sm hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 group/copy"
                      >
                        <span>{c.code}</span>
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-amber-400/60 group-hover/copy:text-amber-400" />
                        )}
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
                        {isPercentage ? `${valNum}% OFF` : `${formatCurrency(valNum)} OFF`}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-2 min-h-[32px]">
                    {c.description || "General promotional discount code for store checkout."}
                  </p>

                  {/* Badges / Rules */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {minSpend ? (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Min: {formatCurrency(minSpend)}
                      </span>
                    ) : null}

                    {maxCap ? (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5">
                        Cap: {formatCurrency(maxCap)}
                      </span>
                    ) : null}

                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-slate-300 border border-white/5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-sky-400" />
                      {c.perUserLimit ? `${c.perUserLimit}x / user` : "1x / user"}
                    </span>
                  </div>

                  {/* Dates & Validity */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : "Now"} –{" "}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Ongoing"}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Metrics & Actions */}
                <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">
                      Redeemed: <strong className="text-white">{used}</strong>
                      {limit ? ` / ${limit}` : ""}
                    </span>
                    {isExpired ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Expired
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-slate-400"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      title="Edit Coupon"
                      className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggle(c)}
                      disabled={isProcessing || isToggling}
                      title={c.isActive ? "Disable Coupon" : "Enable Coupon"}
                      className={`p-1.5 rounded-lg transition-all ${
                        c.isActive
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800/80 hover:bg-zinc-700 text-slate-400"
                      }`}
                    >
                      {isProcessing && isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Power className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(c)}
                      disabled={isProcessing || isDeleting}
                      title="Delete Coupon"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                    >
                      {isProcessing && isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State with Quick Creation ──────────────────── */
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <TicketPercent className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No promotional coupons found in backend</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You can create customized discount vouchers or quickly generate popular welcome campaigns below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Coupon</span>
            </button>
            <button
              onClick={() => handleSeedQuickPromo("ZEVON20", 20, "PERCENTAGE")}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick: 20% Off Promo</span>
            </button>
            <button
              onClick={() => handleSeedQuickPromo("FLAT300", 300, "FIXED_AMOUNT")}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-1.5 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick: ৳300 Flat Voucher</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Coupon Modal ────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <TicketPercent className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingCoupon ? `Edit Coupon (${editingCoupon.code})` : "Create New Coupon"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Coupon Code */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SUMMER25 or LUXE500"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ({symbol} Flat)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "PERCENTAGE" ? "20 (for 20%)" : `30 (for ${symbol}30)`}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Min Spend & Max Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Min Cart Spend ({symbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Max Discount Cap ({symbol})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="e.g. 500"
                    disabled={discountType === "FIXED_AMOUNT"}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400 disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Usage Limit & Per-User Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Overall Campaign Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 500 (blank = unlimited)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Per User Limit *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    placeholder="1"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Description / Campaign Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% discount on silk shirts for Eid collection launch"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-950 text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs text-slate-300 font-medium cursor-pointer"
                >
                  Active and redeemable immediately
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

