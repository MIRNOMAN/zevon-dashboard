"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  DollarSign,
  TrendingDown,
  Plus,
  Edit2,
  X,
} from "lucide-react";
import {
  useGetInventoryAlertsQuery,
} from "@/redux/api/analyticsApi";
import {
  useUpdateVariantStockMutation,
} from "@/redux/api/productsApi";
import type { InventoryAlertItem } from "@/types/analytics";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";

export default function StockAlertsPage() {
  const [threshold, setThreshold] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetInventoryAlertsQuery({ threshold });

  const [updateVariantStock, { isLoading: isUpdatingStock }] = useUpdateVariantStockMutation();

  // Restock modal state
  const [restockTarget, setRestockTarget] = useState<InventoryAlertItem | null>(null);
  const [newStock, setNewStock] = useState<number>(10);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [restockError, setRestockError] = useState<string | null>(null);

  const { format: formatCurrency } = useFormatPrice();

  // Safely parse alerts and summary
  const rawData = res?.data;
  const alerts: InventoryAlertItem[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if ("alerts" in rawData && Array.isArray(rawData.alerts)) {
      return rawData.alerts;
    }
    return [];
  }, [rawData]);

  const summary = useMemo(() => {
    if (rawData && "summary" in rawData && rawData.summary) {
      return rawData.summary;
    }
    return {
      totalAlerts: alerts.length,
      outOfStockCount: alerts.filter((a) => a.stock === 0).length,
      criticalCount: alerts.filter((a) => a.stock > 0 && a.stock <= 2).length,
      lowStockCount: alerts.filter((a) => a.stock > 2 && a.stock <= 5).length,
      threshold,
    };
  }, [rawData, alerts, threshold]);

  // Open restock modal
  const handleOpenRestock = (item: InventoryAlertItem) => {
    setRestockTarget(item);
    setNewStock(item.stock + 10);
    setRestockError(null);
  };

  // Submit restock
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;

    const variantId = restockTarget.variantId || restockTarget.id;
    if (!variantId) {
      setRestockError("Variant ID is missing.");
      return;
    }

    try {
      await updateVariantStock({
        variantId,
        stock: Number(newStock),
      }).unwrap();

      setFeedback(`Successfully updated stock for ${restockTarget.sku} to ${newStock} units!`);
      setRestockTarget(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: unknown) {
      setRestockError(getErrorMessage(err, "Failed to update variant stock."));
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      // Severity Filter
      if (severityFilter === "OUT_OF_STOCK" && item.stock !== 0) return false;
      if (severityFilter === "CRITICAL" && (item.stock === 0 || item.stock > 2)) return false;
      if (severityFilter === "LOW" && (item.stock <= 2 || item.stock > 5)) return false;
      if (severityFilter === "MODERATE" && item.stock <= 5) return false;

      // Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = item.product?.title?.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesColor = item.color.toLowerCase().includes(query);
        const matchesSize = item.size.toLowerCase().includes(query);
        const matchesCategory =
          item.product?.categoryName?.toLowerCase().includes(query) ||
          item.product?.category?.name?.toLowerCase().includes(query);

        return matchesTitle || matchesSku || matchesColor || matchesSize || matchesCategory;
      }

      return true;
    });
  }, [alerts, severityFilter, search]);

  // Buckets for Kanban columns
  const outOfStockItems = useMemo(() => alerts.filter((a) => a.stock === 0), [alerts]);
  const criticalItems = useMemo(() => alerts.filter((a) => a.stock > 0 && a.stock <= 2), [alerts]);
  const lowStockItems = useMemo(() => alerts.filter((a) => a.stock > 2 && a.stock <= 5), [alerts]);
  const moderateItems = useMemo(() => alerts.filter((a) => a.stock > 5), [alerts]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>Low Stock & Inventory Kanban</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time warehouse stock depletion alerts & instant variant restocking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Threshold Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs">
            <span className="text-slate-400 text-[11px] font-medium">Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value={5} className="bg-zinc-900 text-white">≤ 5 units</option>
              <option value={10} className="bg-zinc-900 text-white">≤ 10 units</option>
              <option value={15} className="bg-zinc-900 text-white">≤ 15 units</option>
              <option value={20} className="bg-zinc-900 text-white">≤ 20 units</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh alerts"
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ──────────────────────────────── */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {/* ── Summary KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.totalAlerts}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Threshold ≤ {threshold} units</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-rose-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
              Out of Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{summary.outOfStockCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">0 units available</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-orange-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-400">
              Critical Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-orange-400 mt-2">{summary.criticalCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">1 - 2 units left</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-yellow-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400">
              Low Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-yellow-400 mt-2">{summary.lowStockCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">3 - 5 units left</p>
        </div>
      </div>

      {/* ── Search & Filter Tabs ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by product, SKU, color, or size..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: "ALL", label: `All (${alerts.length})` },
            { id: "OUT_OF_STOCK", label: `Out of Stock (${outOfStockItems.length})` },
            { id: "CRITICAL", label: `Critical (${criticalItems.length})` },
            { id: "LOW", label: `Low (3-5) (${lowStockItems.length})` },
            { id: "MODERATE", label: `Moderate (${moderateItems.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                severityFilter === tab.id
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content View ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 rounded-2xl bg-zinc-900/30 border border-white/5">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-medium">Scanning warehouse stock levels...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-slate-400 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-white">All Inventory Healthy</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No product variants are below the threshold of {threshold} units. Warehouse stock is fully optimized.
            </p>
          </div>
        </div>
      ) : (
        /* ── Kanban Columns View ───────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Out of Stock & Critical (0 - 2 units) */}
          <div className="rounded-2xl bg-zinc-900/60 border border-rose-500/20 p-4 sm:p-5 space-y-3 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Critical & Out of Stock
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {outOfStockItems.length + criticalItems.length}
                </span>
              </div>

              <div className="space-y-3 pt-3">
                {[...outOfStockItems, ...criticalItems].map((item) => (
                  <AlertItemCard
                    key={item.variantId || item.id || item.sku}
                    item={item}
                    formatCurrency={formatCurrency}
                    onRestock={handleOpenRestock}
                  />
                ))}

                {outOfStockItems.length + criticalItems.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No critical stock items.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Low Stock (3 - 5 units) */}
          <div className="rounded-2xl bg-zinc-900/60 border border-amber-500/20 p-4 sm:p-5 space-y-3 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Low Stock (3 - 5 units)
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {lowStockItems.length}
                </span>
              </div>

              <div className="space-y-3 pt-3">
                {lowStockItems.map((item) => (
                  <AlertItemCard
                    key={item.variantId || item.id || item.sku}
                    item={item}
                    formatCurrency={formatCurrency}
                    onRestock={handleOpenRestock}
                  />
                ))}

                {lowStockItems.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No items in 3-5 unit range.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Moderate (6 - Threshold units) */}
          <div className="rounded-2xl bg-zinc-900/60 border border-emerald-500/20 p-4 sm:p-5 space-y-3 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Moderate (6 - {threshold} units)
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {moderateItems.length}
                </span>
              </div>

              <div className="space-y-3 pt-3">
                {moderateItems.map((item) => (
                  <AlertItemCard
                    key={item.variantId || item.id || item.sku}
                    item={item}
                    formatCurrency={formatCurrency}
                    onRestock={handleOpenRestock}
                  />
                ))}

                {moderateItems.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-6">
                    No items in moderate threshold.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Restock Modal ─────────────────────────────────── */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Restock Variant</h3>
                  <p className="text-[11px] text-slate-400">SKU: {restockTarget.sku}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestockTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {restockError && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{restockError}</span>
              </div>
            )}

            <form onSubmit={handleRestockSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 space-y-1">
                <p className="text-slate-300 font-semibold text-xs truncate">
                  {restockTarget.product?.title || "Clothing Garment"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Color: <strong>{restockTarget.color}</strong></span>
                  <span>•</span>
                  <span>Size: <strong>{restockTarget.size}</strong></span>
                  <span>•</span>
                  <span>Current: <strong className="text-rose-400">{restockTarget.stock} units</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  New Total Warehouse Stock Level *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">Quick add:</span>
                {[+5, +10, +25, +50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setNewStock((prev) => Math.max(0, prev + qty))}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-white/5 text-[10px] font-semibold transition-colors"
                  >
                    +{qty}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStock}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUpdatingStock ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Restock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual item card
function AlertItemCard({
  item,
  formatCurrency,
  onRestock,
}: {
  item: InventoryAlertItem;
  formatCurrency: (amount: number | string) => string;
  onRestock: (item: InventoryAlertItem) => void;
}) {
  const isOut = item.stock === 0;
  const isCritical = item.stock > 0 && item.stock <= 2;
  const isLow = item.stock > 2 && item.stock <= 5;

  const categoryName = item.product?.categoryName || item.product?.category?.name || "Apparel";

  return (
    <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/5 hover:border-amber-500/30 transition-all space-y-2.5 group">
      <div className="flex items-start gap-3">
        {/* Thumbnail preview */}
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.product?.title || "Product"} fill unoptimized className="object-cover" />
          ) : (
            <Package className="w-5 h-5 text-slate-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
            {item.product?.title || "Garment"}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
            <span className="font-mono text-slate-500">SKU: {item.sku}</span>
            <span>•</span>
            <span className="text-slate-300">{categoryName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
        <div className="flex items-center gap-2">
          {item.colorCode && (
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block"
              style={{ backgroundColor: item.colorCode }}
            />
          )}
          <span className="text-slate-300 font-medium">
            {item.color} / {item.size}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRestock(item)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all hover:scale-105 cursor-pointer ${
            isOut
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30"
              : isCritical
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
                : isLow
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
          }`}
          title="Click to restock this variant"
        >
          {isOut ? "OUT OF STOCK ↺" : `${item.stock} left ↺`}
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
        <span>Unit Value:</span>
        <span className="text-slate-300 font-medium font-mono">
          {formatCurrency(item.unitPrice || 0)}
        </span>
      </div>
    </div>
  );
}
