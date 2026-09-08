"use client";

import React from "react";
import { TicketPercent, Plus, Copy } from "lucide-react";

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TicketPercent className="w-6 h-6 text-amber-400" />
            <span>Coupons & Promotions</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Create discount vouchers, percentage coupons and usage limits
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c.code} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono font-bold text-amber-400 text-sm">
                {c.code}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">{c.discount}</span>
            </div>
            <p className="text-xs text-slate-400">{c.description}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
              <span>{c.usedCount} times redeemed</span>
              <span className="text-emerald-400">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const coupons = [
  { code: "LUXE20", discount: "20% OFF", description: "Sitewide discount on all new season collections", usedCount: 182 },
  { code: "FIRSTZEVON", discount: "$30 OFF", description: "Welcome voucher on orders above $150", usedCount: 412 },
  { code: "VIPGOLD", discount: "25% OFF", description: "Exclusive discount for loyalty club members", usedCount: 89 },
];
