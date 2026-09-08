"use client";

import React from "react";
import { AlertTriangle, BellRing, RefreshCw } from "lucide-react";

export default function StockAlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Low Stock & Inventory Kanban</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time threshold monitors from /analytics/inventory-alerts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical (< 3) */}
        <div className="rounded-2xl bg-zinc-900/60 border border-rose-500/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">Critical (≤ 2 left)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">2 items</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <h4 className="text-xs font-semibold text-white">Chelsea Italian Suede Boots</h4>
            <p className="text-[10px] text-slate-400">Size: 42 • Only 1 in stock</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <h4 className="text-xs font-semibold text-white">Silk Cashmere Overcoat</h4>
            <p className="text-[10px] text-slate-400">Size: M • Only 2 in stock</p>
          </div>
        </div>

        {/* Low (3 - 5) */}
        <div className="rounded-2xl bg-zinc-900/60 border border-amber-500/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">Low Stock (3 - 5 left)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">3 items</span>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <h4 className="text-xs font-semibold text-white">Tailored Linen Blazer</h4>
            <p className="text-[10px] text-slate-400">Size: L • 3 in stock</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
            <h4 className="text-xs font-semibold text-white">Cashmere Knit Crewneck</h4>
            <p className="text-[10px] text-slate-400">Size: XL • 4 in stock</p>
          </div>
        </div>

        {/* Healthy (> 5) */}
        <div className="rounded-2xl bg-zinc-900/60 border border-emerald-500/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Optimal (5+ in stock)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">142 items</span>
          </div>
          <p className="text-xs text-slate-400">All other catalog items are fully supplied in fulfillment centers.</p>
        </div>
      </div>
    </div>
  );
}
