"use client";

import React from "react";
import { Truck, Plus } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>Shipping Zones & Couriers</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure domestic express, global DHL delivery rates, and courier API assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Domestic Metropolitan Express</h3>
            <span className="text-xs text-emerald-400 font-bold">$10.00 Fixed</span>
          </div>
          <p className="text-xs text-slate-400">1-2 Business Days delivery with signature required.</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">International DHL Air Express</h3>
            <span className="text-xs text-amber-400 font-bold">$35.00 Calculated</span>
          </div>
          <p className="text-xs text-slate-400">3-5 Business Days with duty prepay & tracking.</p>
        </div>
      </div>
    </div>
  );
}
