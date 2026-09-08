"use client";

import React from "react";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useGetInventoryAlertsQuery, type InventoryAlertItem } from "@/redux/api/dashboardApi";

export default function StockAlertsPage() {
  const { data: res, isLoading } = useGetInventoryAlertsQuery({ threshold: 10 });
  const alerts: InventoryAlertItem[] = res?.data || [];

  const critical = alerts.filter((a) => a.stock <= 2);
  const low = alerts.filter((a) => a.stock > 2 && a.stock <= 5);
  const moderate = alerts.filter((a) => a.stock > 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <span>Low Stock & Inventory Kanban</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time threshold monitors from /analytics/inventory-alerts ({alerts.length} alerts active)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Scanning warehouse inventory thresholds...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical (< 3) */}
          <div className="rounded-2xl bg-zinc-900/60 border border-rose-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Critical (≤ 2 left)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                {critical.length} items
              </span>
            </div>
            {critical.length > 0 ? (
              critical.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1"
                >
                  <h4 className="text-xs font-semibold text-white">
                    {item.product?.title || "Clothing Item"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {item.color} / {item.size} • SKU: {item.sku}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-rose-400">
                    Only {item.stock} left in stock
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No critical items.</p>
            )}
          </div>

          {/* Low (3 - 5) */}
          <div className="rounded-2xl bg-zinc-900/60 border border-amber-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Low Stock (3 - 5 left)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                {low.length} items
              </span>
            </div>
            {low.length > 0 ? (
              low.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1"
                >
                  <h4 className="text-xs font-semibold text-white">
                    {item.product?.title || "Clothing Item"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {item.color} / {item.size} • SKU: {item.sku}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-amber-400">
                    {item.stock} units remaining
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No low stock items.</p>
            )}
          </div>

          {/* Moderate */}
          <div className="rounded-2xl bg-zinc-900/60 border border-emerald-500/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Moderate (6 - 10 left)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                {moderate.length} items
              </span>
            </div>
            {moderate.length > 0 ? (
              moderate.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1"
                >
                  <h4 className="text-xs font-semibold text-white">
                    {item.product?.title || "Clothing Item"}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {item.color} / {item.size} • SKU: {item.sku}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-400">
                    {item.stock} units
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No moderate items.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
