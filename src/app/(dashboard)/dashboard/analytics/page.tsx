"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Calendar,
  Download,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            <span>Analytics & Intelligence</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            30-day performance aggregated from /analytics/dashboard and sales reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Last 30 Days</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Metric Highlights ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Gross Sales
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
            $142,890.50
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+22.4% vs previous period</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Conversion Rate
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
            3.64%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+0.8% benchmark</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Orders Fulfilled
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
            1,894
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>98.6% on-time delivery</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Refund & Return Rate
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
            1.12%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
            <span>Industry best quartile</span>
          </div>
        </div>
      </div>

      {/* ── Top Selling Products ───────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-white">Top Performing Garments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-2">Garment</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Units Sold</th>
                <th className="py-3 px-2">Revenue Generated</th>
                <th className="py-3 px-2 text-right">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {topProducts.map((p, i) => (
                <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-2 font-mono text-amber-400 font-bold">
                    #{i + 1}
                  </td>
                  <td className="py-3.5 px-2 font-semibold text-white">{p.name}</td>
                  <td className="py-3.5 px-2 text-slate-400">{p.category}</td>
                  <td className="py-3.5 px-2 font-medium tabular-nums">{p.sales}</td>
                  <td className="py-3.5 px-2 font-bold text-emerald-400 tabular-nums">
                    ${p.revenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2 text-right font-mono text-slate-300">
                    {p.stock} pcs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const topProducts = [
  { name: "Pure Mulberry Silk Shirt", category: "Apparel", sales: 420, revenue: 63000, stock: 45 },
  { name: "Italian Wool Tailored Trousers", category: "Bottoms", sales: 315, revenue: 47250, stock: 28 },
  { name: "Merino Cashmere Cardigan", category: "Knitwear", sales: 290, revenue: 40600, stock: 19 },
  { name: "Handcrafted Calfskin Loafers", category: "Footwear", sales: 180, revenue: 39600, stock: 12 },
];
