"use client";

import React, { useState } from "react";
import { Zap, Plus, Clock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGetFlashSalesQuery, type FlashSaleItem } from "@/redux/api/dashboardApi";

export default function FlashSalesPage() {
  const { data: res, isLoading } = useGetFlashSalesQuery();

  const rawData = res?.data;
  let flashSales: FlashSaleItem[] = [];
  if (Array.isArray(rawData)) {
    flashSales = rawData;
  } else if (rawData && "flashSales" in rawData) {
    flashSales = rawData.flashSales;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Flash Sales & Timed Drops</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure countdown campaigns, limited volume drops, and live deal timers
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching flash sale campaigns from backend...</span>
          </div>
        ) : flashSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashSales.map((sale) => (
              <div
                key={sale.id}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sale.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                      }`}
                    />
                    <h2 className="text-sm font-bold text-white">{sale.title}</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {sale.discountPercentage}% OFF
                  </span>
                </div>

                {sale.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{sale.description}</p>
                )}

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {new Date(sale.startTime).toLocaleDateString()} –{" "}
                      {new Date(sale.endTime).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      sale.isActive ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {sale.isActive ? "ACTIVE" : "ENDED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No flash sales currently active on backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
