"use client";

import React, { useState } from "react";
import { ShoppingBag, Loader2, AlertCircle } from "lucide-react";
import { useGetAdminOrdersQuery, type OrderItem } from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function OrdersPage() {
  const { format: formatCurrency } = useFormatPrice();
  const [activeTab, setActiveTab] = useState("ALL");
  const { data: res, isLoading } = useGetAdminOrdersQuery();

  const rawData = res?.data;
  let orders: OrderItem[] = [];
  if (Array.isArray(rawData)) {
    orders = rawData;
  } else if (rawData && "orders" in rawData) {
    orders = rawData.orders;
  }

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "ALL") return true;
    return o.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>Orders & Atomic Fulfillment</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live orders feed from /orders endpoint ({filteredOrders.length} orders)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching orders from zevon-server...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Shipment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white">{o.user?.name || "Customer"}</div>
                      <div className="text-[10px] text-slate-500">{o.user?.email || "verified"}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {o.paymentMethod} • {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-white">{formatCurrency(o.total)}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {o.status}
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
            <p>No orders found under &quot;{activeTab}&quot; status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
