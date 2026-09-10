"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  Calendar,
  Download,
  Loader2,
  Users,
  RotateCcw,
  Package,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useGetDashboardMetricsQuery } from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function AnalyticsPage() {
  const { data: analyticsRes, isLoading, refetch } = useGetDashboardMetricsQuery();
  const { format: formatCurrency } = useFormatPrice();
  const [selectedRange, setSelectedRange] = useState("30");

  const metrics = analyticsRes?.data;
  const kpis = metrics?.kpis;

  const grossSales = kpis?.totalRevenue ?? metrics?.totalRevenue ?? 0;
  const totalOrders = kpis?.totalOrders ?? metrics?.totalOrders ?? 0;
  const totalCustomers = kpis?.totalCustomers ?? metrics?.totalCustomers ?? 0;
  const conversionRate = kpis?.conversionRate ?? metrics?.conversionRate ?? 0;
  const avgOrderValue = kpis?.averageOrderValue ?? metrics?.averageOrderValue ?? 0;

  const totalReturns = metrics?.returnsSummary?.totalReturns ?? 0;
  const returnRate =
    totalOrders > 0
      ? Number(((totalReturns / totalOrders) * 100).toFixed(2))
      : 0;

  const topProducts = metrics?.topSellingProducts || [];
  const dailySales = metrics?.dailySalesChart || [];

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (!topProducts.length && !dailySales.length) {
      alert("No analytics data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ZEVON LUXURY APPAREL - ANALYTICS REPORT\n";
    csvContent += `Generated At: ${new Date().toLocaleString()}\n\n`;

    csvContent += "METRIC SUMMARY\n";
    csvContent += `Gross Sales,${grossSales}\n`;
    csvContent += `Total Orders,${totalOrders}\n`;
    csvContent += `Total Customers,${totalCustomers}\n`;
    csvContent += `Conversion Rate,${conversionRate}%\n`;
    csvContent += `Average Order Value,${avgOrderValue}\n`;
    csvContent += `Total Returns,${totalReturns}\n\n`;

    csvContent += "TOP PERFORMING GARMENTS\n";
    csvContent += "Rank,Garment Title,Category,Units Sold,Revenue Generated,In Stock\n";

    topProducts.forEach((p, idx) => {
      csvContent += `"${idx + 1}","${p.productTitle.replace(/"/g, '""')}","${p.category || "Apparel"}","${p.totalUnitsSold}","${p.totalRevenue}","${p.inStock || 0}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zevon_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Live 30-day performance aggregated dynamically from /analytics/dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Last 30 Days</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-semibold shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-zinc-900/40 rounded-3xl border border-white/10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs tracking-wider uppercase text-slate-400">
            Aggregating luxury telemetry & intelligence from zevon-server...
          </span>
        </div>
      ) : (
        <>
          {/* ── Metric Highlights ──────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. Gross Sales */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Gross Sales</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
                {formatCurrency(grossSales)}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live paid order revenue</span>
              </div>
            </div>

            {/* 2. Conversion Rate */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Conversion Rate</span>
                <Percent className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
                {conversionRate}%
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Cart to checkout conversion</span>
              </div>
            </div>

            {/* 3. Total Orders Fulfilled */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
                {totalOrders.toLocaleString()}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Avg Order: {formatCurrency(avgOrderValue)}</span>
              </div>
            </div>

            {/* 4. Refund & Return Rate */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Refund & Return Rate</span>
                <RotateCcw className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-black text-white tabular-nums">
                {returnRate}%
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <span>{totalReturns} return requests processed</span>
              </div>
            </div>
          </div>

          {/* ── 30-Day Revenue Trend Summary ────────────────────────── */}
          {dailySales.length > 0 && (
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>30-Day Daily Sales Velocity</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Day-by-day revenue generated across the last 30 calendar days
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  Total 30-Day Sum: {formatCurrency(grossSales)}
                </span>
              </div>

              {/* Visual Daily Revenue Bars */}
              <div className="h-32 flex items-end gap-1 sm:gap-1.5 pt-4 border-t border-white/5 overflow-x-auto pb-2">
                {dailySales.map((d, idx) => {
                  const maxRevenue = Math.max(...dailySales.map((x) => x.revenue), 100);
                  const heightPercent = Math.max(Math.round((d.revenue / maxRevenue) * 100), 4);
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[10px] sm:min-w-[14px] flex flex-col items-center gap-1 group relative cursor-pointer"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-20 pointer-events-none shadow-xl">
                        <span className="font-mono text-amber-400">{d.date}: </span>
                        <span>{formatCurrency(d.revenue)}</span> ({d.orderCount} orders)
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all group-hover:brightness-125 ${
                          d.revenue > 0
                            ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm shadow-amber-500/20"
                            : "bg-zinc-800/40"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                <span>{dailySales[0]?.date || "30 Days Ago"}</span>
                <span>Today</span>
              </div>
            </div>
          )}

          {/* ── Top Selling Garments Table ─────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Top Performing Garments</h2>
                <p className="text-xs text-slate-400">
                  Live ranking based on sales velocity, revenue, and active warehouse stock
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {topProducts.length} Items Listed
              </span>
            </div>

            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Garment</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Units Sold</th>
                      <th className="py-3 px-3">Revenue Generated</th>
                      <th className="py-3 px-3 text-right">In Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {topProducts.map((p, i) => (
                      <tr key={p.productId || p.productTitle} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">
                          #{i + 1}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center font-bold text-amber-400 text-xs">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.productTitle} className="w-full h-full object-cover" />
                              ) : (
                                p.productTitle.charAt(0)
                              )}
                            </div>
                            <div className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                              {p.productTitle}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400 font-medium">
                          {p.category || "Apparel"}
                        </td>
                        <td className="py-3.5 px-3 font-medium tabular-nums">
                          {p.totalUnitsSold > 0 ? `${p.totalUnitsSold} pcs` : "0 pcs (New)"}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(p.totalRevenue)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              (p.inStock || 0) > 10
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : (p.inStock || 0) > 0
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {p.inStock || 0} pcs
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <p>No product telemetry recorded yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
