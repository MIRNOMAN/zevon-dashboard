"use client";

import React from "react";
import { Zap, Plus, Clock } from "lucide-react";

export default function FlashSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Flash Sales & Timed Drops</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure countdown campaigns, limited volume flash drops, and deal timers
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>Launch Flash Sale</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white">Autumn Cashmere Drop</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">35% discount on curated knitwear pieces</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Ends in: 14h 28m 10s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
