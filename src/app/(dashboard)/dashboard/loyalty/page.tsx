"use client";

import React from "react";
import { Award, Gift, Users } from "lucide-react";

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <span>Loyalty & Referral Rewards</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure VIP tier thresholds, points accrual, and customer referral rewards
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase">Tier 1: Silver Guild</span>
          <p className="text-xs text-slate-300">1 pt per $1 spent • 5% birthday discount</p>
          <p className="text-[11px] text-slate-500">1,240 enrolled members</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase">Tier 2: Gold Atelier</span>
          <p className="text-xs text-slate-300">2 pts per $1 spent • Free bespoke tailoring</p>
          <p className="text-[11px] text-slate-500">482 enrolled members</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase">Tier 3: Platinum Bespoke</span>
          <p className="text-xs text-slate-300">3 pts per $1 spent • Private concierge styling</p>
          <p className="text-[11px] text-slate-500">96 enrolled members</p>
        </div>
      </div>
    </div>
  );
}
