"use client";

import React from "react";
import { Star, Check, X } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-400" />
            <span>Product Reviews & Moderation</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Moderate verified customer feedback, rating scores, and quality sentiments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">{r.customer}</h3>
                <p className="text-[10px] text-slate-500">{r.product}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-300 italic">&ldquo;{r.comment}&rdquo;</p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
              <span className="text-slate-500">{r.date}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">Approved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const reviews = [
  { id: "1", customer: "Emma Watson", product: "Silk Cashmere Overcoat", rating: 5, comment: "Exquisite tailoring and the weight of the silk is unmatched. Outstanding luxury craftsmanship.", date: "Sep 07, 2026" },
  { id: "2", customer: "Liam Hemsworth", product: "Italian Wool Trousers", rating: 5, comment: "Perfect drape and comfortable waistband. Will purchase in charcoal as well.", date: "Sep 05, 2026" },
];
