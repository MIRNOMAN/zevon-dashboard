"use client";

import React from "react";
import { Store, MapPin } from "lucide-react";

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-400" />
            <span>Physical Flagship Stores</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage flagship retail branches, in-store pickup reservations, and boutique hours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">ZEVON Gulshan Atelier</h3>
          </div>
          <p className="text-xs text-slate-400">Avenue 12, Gulshan-2, Dhaka 1212</p>
          <p className="text-[11px] text-emerald-400 font-semibold">Open: 10:00 AM – 9:00 PM • Pickup Available</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">ZEVON Mayfair Boutique</h3>
          </div>
          <p className="text-xs text-slate-400">24 Mount Street, London W1K 2RR</p>
          <p className="text-[11px] text-emerald-400 font-semibold">Open: 10:00 AM – 7:00 PM • Bespoke Fitting</p>
        </div>
      </div>
    </div>
  );
}
