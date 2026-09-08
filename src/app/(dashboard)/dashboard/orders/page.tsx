"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, Filter, CheckCircle2, Clock, Truck, Eye } from "lucide-react";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <span>Orders & Atomic Fulfillment</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Track order status, manage couriers, issue invoices and handle payments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
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
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {mockOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-white">{o.orderNumber}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{o.customer}</div>
                    <div className="text-[10px] text-slate-500">{o.email}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{o.date}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {o.paymentMethod} • {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-white">${o.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
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

const mockOrders = [
  { id: "1", orderNumber: "ZEV-90142", customer: "Sophia Loren", email: "sophia@example.com", date: "Sep 08, 2026", paymentMethod: "STRIPE", paymentStatus: "PAID", amount: 340.0, status: "PROCESSING" },
  { id: "2", orderNumber: "ZEV-90141", customer: "Lucas Scott", email: "lucas@example.com", date: "Sep 08, 2026", paymentMethod: "COD", paymentStatus: "PENDING", amount: 195.0, status: "CONFIRMED" },
  { id: "3", orderNumber: "ZEV-90140", customer: "Emma Watson", email: "emma@example.com", date: "Sep 07, 2026", paymentMethod: "BKASH", paymentStatus: "PAID", amount: 480.0, status: "DELIVERED" },
];
