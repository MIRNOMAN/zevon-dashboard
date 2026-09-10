"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/authSlice";
import {
  useGetDashboardMetricsQuery,
  useGetInventoryAlertsQuery,
  useGetAdminOrdersQuery,
} from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function DashboardOverviewPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { format: formatCurrency } = useFormatPrice();

  const { data: metricsRes, isLoading: isMetricsLoading } =
    useGetDashboardMetricsQuery();
  const { data: alertsRes, isLoading: isAlertsLoading } =
    useGetInventoryAlertsQuery();
  const { data: ordersRes, isLoading: isOrdersLoading } =
    useGetAdminOrdersQuery({ limit: 5 });

  const metrics = metricsRes?.data;
  const rawAlerts = alertsRes?.data;
  const stockAlerts = Array.isArray(rawAlerts)
    ? rawAlerts
    : rawAlerts && "alerts" in rawAlerts && Array.isArray(rawAlerts.alerts)
      ? rawAlerts.alerts
      : [];

  // Extract orders
  const rawOrders = ordersRes?.data;
  const recentOrders = Array.isArray(rawOrders)
    ? rawOrders
    : rawOrders && "orders" in rawOrders
      ? rawOrders.orders
      : [];

  const totalRevenue = metrics?.totalRevenue ?? 0;
  const totalOrders = metrics?.totalOrders ?? 0;
  const aov = metrics?.averageOrderValue ?? 0;
  const totalCustomers = metrics?.totalCustomers ?? 0;
  const growth = metrics?.revenueGrowthPercentage ?? 0;

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Hello, {currentUser?.name || "Admin"}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Welcome to the ZEVON Luxury Commerce Control Center. Live backend feed active.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products?new=1"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isMetricsLoading ? (
              <div className="h-8 w-28 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {formatCurrency(totalRevenue)}
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold">+{growth}%</span>
              <span className="text-slate-400">growth</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isMetricsLoading ? (
              <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {totalOrders.toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold">+12.4%</span>
              <span className="text-slate-400">volume</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Order Value
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isMetricsLoading ? (
              <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {formatCurrency(aov)}
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold">+5.1%</span>
              <span className="text-slate-400">basket health</span>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Customers
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {isMetricsLoading ? (
              <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {totalCustomers.toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold">+24.0%</span>
              <span className="text-slate-400">new shoppers</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Sections ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-zinc-900/60 border border-white/10 p-5 sm:p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Recent Orders</h2>
              <p className="text-xs text-slate-400">
                Live order records from backend
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isOrdersLoading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Loading recent orders...</span>
              </div>
            ) : recentOrders.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-2">Order #</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="font-medium text-white">{order.user?.name || "Customer"}</div>
                        <div className="text-[10px] text-slate-500">{order.user?.email || "verified"}</div>
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : order.status === "PROCESSING"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link
                          href={`/dashboard/orders`}
                          className="text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No orders found in database yet. New orders will appear here in real-time.
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts & Quick Actions (1 Column) */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 sm:p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">Stock Alerts</h2>
              </div>
              <Link
                href="/dashboard/stock-alerts"
                className="text-xs text-amber-400 hover:underline"
              >
                Kanban
              </Link>
            </div>

            <div className="space-y-2.5">
              {isAlertsLoading ? (
                <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Checking inventory...</span>
                </div>
              ) : stockAlerts.length > 0 ? (
                stockAlerts.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.product?.title || "Clothing Garment"}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {item.color} / {item.size} • SKU: {item.sku}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold shrink-0">
                      {item.stock} left
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  All clothing inventory items are well-stocked!
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/flash-sales"
                className="p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-xs font-medium text-slate-300 hover:text-amber-400 flex items-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Flash Sales</span>
              </Link>
              <Link
                href="/dashboard/coupons"
                className="p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-xs font-medium text-slate-300 hover:text-amber-400 flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Coupons</span>
              </Link>
              <Link
                href="/dashboard/lookbooks"
                className="p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-xs font-medium text-slate-300 hover:text-amber-400 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lookbooks</span>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5 transition-all text-xs font-medium text-slate-300 hover:text-amber-400 flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
