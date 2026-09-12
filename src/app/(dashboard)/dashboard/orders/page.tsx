"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
  CreditCard,
  MapPin,
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Ban,
  ArrowRight,
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useAssignCourierMutation,
} from "@/redux/api/ordersApi";
import { useFormatPrice } from "@/lib/useFormatPrice";
import { getErrorMessage } from "@/lib/utils";
import type {
  OrderItem,
  OrderStatus,
  PaymentStatus,
  AddressSnapshot,
} from "@/types/orders";

const STATUS_TABS: Array<{ id: string; label: string }> = [
  { id: "ALL", label: "All Orders" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "PROCESSING", label: "Processing" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
];

const ORDER_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const COURIER_PRESETS = [
  "Steadfast Courier",
  "Pathao Logistics",
  "RedX Express",
  "Paperfly",
  "DHL Express",
  "FedEx International",
];

export default function OrdersPage() {
  const { format: formatCurrency } = useFormatPrice();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetAdminOrdersQuery();

  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [updatePaymentStatus, { isLoading: isUpdatingPayment }] = useUpdatePaymentStatusMutation();
  const [assignCourier, { isLoading: isAssigningCourier }] = useAssignCourierMutation();

  // Selected Order Drawer / Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Courier form state inside modal
  const [courierName, setCourierName] = useState("Steadfast Courier");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safely extract orders array
  const rawData = res?.data;
  const orders: OrderItem[] = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if ("orders" in rawData && Array.isArray(rawData.orders)) {
      return rawData.orders;
    }
    return [];
  }, [rawData]);

  // Sync selectedOrder if it gets updated in the list
  const activeOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) || selectedOrder;
  }, [orders, selectedOrder]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const totalRevenue = orders.reduce((sum, o) => {
      const amount = Number(o.totalAmount ?? o.total ?? 0);
      return o.status !== "CANCELLED" ? sum + amount : sum;
    }, 0);

    const pendingProcessingCount = orders.filter(
      (o) => o.status === "PENDING" || o.status === "CONFIRMED" || o.status === "PROCESSING",
    ).length;

    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

    return { total, totalRevenue, pendingProcessingCount, deliveredCount };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (activeTab !== "ALL" && o.status !== activeTab) return false;

      // Payment filter
      if (paymentFilter !== "ALL" && o.paymentStatus !== paymentFilter) return false;

      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesOrderNumber = o.orderNumber.toLowerCase().includes(query);
        const matchesName = o.user?.name?.toLowerCase().includes(query);
        const matchesEmail = o.user?.email?.toLowerCase().includes(query);
        const matchesPhone = o.user?.phone?.toLowerCase().includes(query);
        return matchesOrderNumber || matchesName || matchesEmail || matchesPhone;
      }

      return true;
    });
  }, [orders, activeTab, paymentFilter, search]);

  // Handle Status Update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus({
        id: orderId,
        data: { status: newStatus },
      }).unwrap();

      showFeedback("success", `Order status transitioned to "${newStatus}"!`);
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to update order status."));
    }
  };

  // Handle Payment Status Update
  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    try {
      await updatePaymentStatus({
        id: orderId,
        data: { paymentStatus: newPaymentStatus },
      }).unwrap();

      showFeedback("success", `Payment status updated to "${newPaymentStatus}"!`);
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to update payment status."));
    }
  };

  // Handle Courier Assignment
  const handleAssignCourierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !trackingNumber.trim()) return;

    try {
      await assignCourier({
        id: activeOrder.id,
        data: {
          courierName,
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || undefined,
        },
      }).unwrap();

      showFeedback("success", `Courier "${courierName}" assigned and order marked as SHIPPED!`);
      setTrackingNumber("");
      setTrackingUrl("");
    } catch (err: unknown) {
      showFeedback("error", getErrorMessage(err, "Failed to assign courier."));
    }
  };

  // Open Details Modal
  const openOrderDetails = (order: OrderItem) => {
    setSelectedOrder(order);
    setCourierName(order.courierName || "Steadfast Courier");
    setTrackingNumber(order.trackingNumber || "");
    setTrackingUrl(order.trackingUrl || "");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>Orders & Atomic Fulfillment</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time multi-currency order processing, inventory locking, and courier dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh orders feed"
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ──────────────────────────────── */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── KPI Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{stats.total}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">All customer orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Gross Volume
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Excluding cancelled</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              In Processing
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-orange-400 mt-2">
            {stats.pendingProcessingCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Pending fulfillment</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Delivered
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Truck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-400 mt-2">{stats.deliveredCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Fulfilled successfully</p>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, email, or phone..."
            className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-zinc-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-950 border border-white/10 text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Payment</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-zinc-950/60 border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Orders Table ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-medium">Fetching orders from server...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Shipment Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredOrders.map((o) => {
                  const amount = Number(o.totalAmount ?? o.total ?? 0);
                  const isPaid = o.paymentStatus === "PAID";
                  const isDelivered = o.status === "DELIVERED";
                  const isCancelled = o.status === "CANCELLED";

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => openOrderDetails(o)}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white group-hover:text-amber-400 transition-colors">
                            {o.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(o.orderNumber, o.id);
                            }}
                            className="p-1 text-slate-500 hover:text-white transition-colors"
                            title="Copy Order Number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {copiedId === o.id && (
                          <span className="text-[9px] text-emerald-400 block">Copied!</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">
                          {o.user?.name || "Verified Customer"}
                        </div>
                        <div className="text-[10px] text-slate-500">{o.user?.email}</div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            {o.paymentMethod}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : o.paymentStatus === "FAILED"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-white font-mono text-sm">
                        {formatCurrency(amount)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isDelivered
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : isCancelled
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : o.status === "SHIPPED"
                                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                  : o.status === "PROCESSING"
                                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{o.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetails(o);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black border border-white/10 text-xs font-semibold text-slate-300 transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-7 h-7 text-amber-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No Orders Found</p>
            <p className="text-slate-400">
              No customer orders match &quot;{activeTab}&quot; status filter.
            </p>
          </div>
        )}
      </div>

      {/* ── Order Management Modal / Details Drawer ─────────────── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-zinc-950/70 gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white font-mono">
                        {activeOrder.orderNumber}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase font-mono">
                        {activeOrder.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* ── 1. Lifecycle Status Stepper & Transition ───────────── */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Fulfillment Lifecycle</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Current: <strong className="text-amber-400">{activeOrder.status}</strong>
                  </span>
                </div>

                {/* Stepper Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {ORDER_STEPS.map((st) => {
                    const isCurrent = activeOrder.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(activeOrder.id, st)}
                        disabled={isUpdatingStatus}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                          isCurrent
                            ? "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20"
                            : "bg-zinc-900 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="text-[10px] font-mono">{st}</span>
                        {isCurrent && <span className="text-[9px] font-normal">Active</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Cancel Action */}
                {activeOrder.status !== "CANCELLED" && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(activeOrder.id, "CANCELLED")}
                      disabled={isUpdatingStatus}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel & Restore Inventory</span>
                    </button>
                  </div>
                )}
              </div>

              {/* ── 2. Payment & Courier Assignment ────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Status Card */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Payment Information</span>
                  </h4>

                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <strong className="text-white uppercase font-mono">{activeOrder.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <strong
                        className={
                          activeOrder.paymentStatus === "PAID"
                            ? "text-emerald-400 font-bold"
                            : "text-amber-400 font-bold"
                        }
                      >
                        {activeOrder.paymentStatus}
                      </strong>
                    </div>
                  </div>

                  {/* Payment Status Dropdown Switcher */}
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 shrink-0">Update Status:</span>
                    <select
                      value={activeOrder.paymentStatus}
                      onChange={(e) =>
                        handlePaymentStatusChange(activeOrder.id, e.target.value as PaymentStatus)
                      }
                      disabled={isUpdatingPayment}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </div>
                </div>

                {/* Courier Assignment Card */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>Courier & Tracking</span>
                  </h4>

                  <form onSubmit={handleAssignCourierSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                          Courier Partner
                        </label>
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                        >
                          {COURIER_PRESETS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">
                          Tracking Code
                        </label>
                        <input
                          type="text"
                          required
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. STF-8921829"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAssigningCourier || !trackingNumber.trim()}
                      className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isAssigningCourier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Assign & Mark as Shipped</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* ── 3. Ordered Garments & Items List ───────────────────── */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Ordered Items ({activeOrder.items?.length || 0})</span>
                </h4>

                <div className="rounded-xl bg-zinc-950 border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/60 border-b border-white/5 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item Details</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Variant</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {activeOrder.items && activeOrder.items.length > 0 ? (
                        activeOrder.items.map((it, idx) => {
                          const unit = Number(it.unitPrice || 0);
                          const lineTotal = Number(it.totalPrice || unit * it.quantity);
                          const img = it.product?.images?.[0]?.url;

                          return (
                            <tr key={it.id || idx} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                                    {img ? (
                                      <Image src={img} alt={it.productTitle} fill unoptimized className="object-cover" />
                                    ) : (
                                      <Package className="w-4 h-4 text-slate-500" />
                                    )}
                                  </div>
                                  <span className="font-semibold text-white truncate max-w-[180px]">
                                    {it.productTitle}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-400">{it.sku}</td>
                              <td className="py-3 px-3 text-slate-300">
                                {it.color} / {it.size}
                              </td>
                              <td className="py-3 px-3 font-bold text-white">{it.quantity}</td>
                              <td className="py-3 px-3 font-mono text-slate-400">{formatCurrency(unit)}</td>
                              <td className="py-3 px-3 font-mono font-bold text-white text-right">
                                {formatCurrency(lineTotal)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                            No line items details available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── 4. Customer & Shipping Address & Financials ───────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Address Snapshot */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>Customer & Delivery Address</span>
                  </h4>

                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p className="font-semibold text-white text-xs">
                      {activeOrder.user?.name || "Verified Customer"}
                    </p>
                    <p>Email: <span className="text-slate-200">{activeOrder.user?.email}</span></p>
                    {activeOrder.user?.phone && (
                      <p>Phone: <span className="text-slate-200">{activeOrder.user.phone}</span></p>
                    )}
                    {activeOrder.shippingAddress && (
                      <div className="pt-2 border-t border-white/5 text-slate-300 leading-relaxed">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                          Shipping Address:
                        </span>
                        {typeof activeOrder.shippingAddress === "object" ? (
                          <>
                            <p>{(activeOrder.shippingAddress as AddressSnapshot).streetAddress}</p>
                            <p>
                              {(activeOrder.shippingAddress as AddressSnapshot).city},{" "}
                              {(activeOrder.shippingAddress as AddressSnapshot).country}
                            </p>
                          </>
                        ) : (
                          <p>{String(activeOrder.shippingAddress)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span>Financials Breakdown</span>
                  </h4>

                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono text-white">
                        {formatCurrency(Number(activeOrder.subtotal || 0))}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-mono text-white">
                        {formatCurrency(Number(activeOrder.shippingCost || 0))}
                      </span>
                    </div>

                    {Number(activeOrder.discountAmount || activeOrder.discount || 0) > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Coupon Discount:</span>
                        <span className="font-mono">
                          -{formatCurrency(Number(activeOrder.discountAmount || activeOrder.discount || 0))}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                      <span>Total Amount:</span>
                      <span className="font-mono text-amber-400 text-base">
                        {formatCurrency(Number(activeOrder.totalAmount ?? activeOrder.total ?? 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
