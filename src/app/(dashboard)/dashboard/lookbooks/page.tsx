"use client";

import React from "react";
import { Sparkles, Plus } from "lucide-react";

export default function LookbooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Lookbooks & Outfits</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Curate fashion ensembles, editorial lookbooks, and complete outfit recommendations
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>New Lookbook</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
          <div className="h-40 rounded-xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-xs text-slate-400">
            Editorial Lookbook: The Italian Riviera Autumn
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Autumn Riviera 2026</h3>
            <span className="text-xs text-amber-400 font-semibold">6 Garment Ensemble</span>
          </div>
        </div>
      </div>
    </div>
  );
}
