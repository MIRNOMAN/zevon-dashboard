"use client";

import React, { useState } from "react";
import { TicketPercent, Plus, Loader2, CheckCircle2 } from "lucide-react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  type CouponItem,
} from "@/redux/api/dashboardApi";

export default function CouponsPage() {
  const { data: res, isLoading } = useGetCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [description, setDescription] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const rawData = res?.data;
  let coupons: CouponItem[] = [];
  if (Array.isArray(rawData)) {
    coupons = rawData;
  } else if (rawData && "coupons" in rawData) {
    coupons = rawData.coupons;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    try {
      await createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        description: description.trim() || undefined,
        isActive: true,
      }).unwrap();

      setFeedback(`Coupon "${code.toUpperCase()}" created successfully!`);
      setCode("");
      setDiscountValue("");
      setDescription("");
      setShowModal(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert("Failed to create coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TicketPercent className="w-6 h-6 text-amber-400" />
            <span>Coupons & Promotions</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live promotions from /coupons ({coupons.length} vouchers active)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Fetching coupons...</span>
        </div>
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-amber-400 text-sm">
                  {c.code}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  {c.discountType === "PERCENTAGE"
                    ? `${c.discountValue}% OFF`
                    : `$${c.discountValue} OFF`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {c.description || "Valid on all store apparel."}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
                <span>{c.usageCount || 0} times redeemed</span>
                <span className={c.isActive ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                  {c.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-xs text-slate-400">
          No promotional coupons found in database. Create a new coupon to get started.
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Coupon</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. LUXE25"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED_AMOUNT")}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 20% off all silk overcoats"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5"
                >
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
