"use client";

import React from "react";
import { Image as ImageIcon, Plus } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>Promotional Banners & Sliders</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage storefront hero banners, seasonal lookbook sliders, and promotional callouts
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>Upload Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md space-y-3">
          <div className="h-36 rounded-xl bg-gradient-to-r from-amber-900/40 via-zinc-900 to-black border border-white/10 flex items-center justify-center text-slate-400 text-xs">
            Hero Slider 1: Luxury Autumn Collection
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Homepage Hero Top</span>
            <span className="text-emerald-400 font-medium">Active (Priority 1)</span>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md space-y-3">
          <div className="h-36 rounded-xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-black border border-white/10 flex items-center justify-center text-slate-400 text-xs">
            Mid-Page Promo: Handcrafted Italian Footwear
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Category Banner</span>
            <span className="text-emerald-400 font-medium">Active (Priority 2)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
