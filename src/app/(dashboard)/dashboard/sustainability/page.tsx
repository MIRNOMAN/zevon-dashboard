"use client";

import React from "react";
import { Leaf, Award } from "lucide-react";

export default function SustainabilityPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span>Sustainability & Ethical Metrics</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Organic silk certifications, zero-waste cashmere recycling, and carbon offset logs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase">Organic Sourcing</span>
          <div className="text-2xl font-black text-white">94.2%</div>
          <p className="text-xs text-slate-400">Certified GOTS organic silk & pure wool</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase">Carbon Offset</span>
          <div className="text-2xl font-black text-white">100%</div>
          <p className="text-xs text-slate-400">All DHL Air express dispatches neutralized</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase">Plastic-Free Packaging</span>
          <div className="text-2xl font-black text-white">100%</div>
          <p className="text-xs text-slate-400">Biodegradable mulberry paper & cotton garment bags</p>
        </div>
      </div>
    </div>
  );
}
