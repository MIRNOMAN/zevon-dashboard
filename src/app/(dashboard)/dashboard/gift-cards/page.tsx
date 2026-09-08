"use client";

import React from "react";
import { Gift, Plus } from "lucide-react";

export default function GiftCardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-amber-400" />
            <span>Digital Gift Cards</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Issue and track luxury gift vouchers and digital redeemable cards
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit">
          <Plus className="w-4 h-4" />
          <span>Issue Gift Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.code} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-amber-400 text-xs">{c.code}</span>
              <span className="text-sm font-bold text-white">${c.balance.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400">Recipient: {c.recipient}</p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
              <span>Expires: {c.expiry}</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cards = [
  { code: "ZEV-GIFT-8821", balance: 250.0, recipient: "catherine@example.com", expiry: "Dec 31, 2026" },
  { code: "ZEV-GIFT-5419", balance: 500.0, recipient: "arthur@example.com", expiry: "Jan 15, 2027" },
];
