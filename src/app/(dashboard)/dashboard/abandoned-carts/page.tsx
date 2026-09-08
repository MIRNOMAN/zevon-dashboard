"use client";

import React from "react";
import { ShoppingCart, Send } from "lucide-react";

export default function AbandonedCartsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
            <span>Abandoned Cart Recovery</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Automated recovery emails, discounts, and high-intent customer follow-ups
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Cart Value</th>
              <th className="py-3 px-3">Abandoned Date</th>
              <th className="py-3 px-3">Recovery Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {carts.map((c) => (
              <tr key={c.email} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-white">{c.customer}</div>
                  <div className="text-[10px] text-slate-500">{c.email}</div>
                </td>
                <td className="py-3.5 px-3 font-bold text-white">${c.value.toFixed(2)}</td>
                <td className="py-3.5 px-3 text-slate-400">{c.date}</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold">
                    <Send className="w-3 h-3" />
                    <span>Send Reminder</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const carts = [
  { customer: "Marcus Aurelius", email: "marcus@example.com", value: 580.0, date: "2 hours ago", status: "PENDING REMINDER" },
  { customer: "Elena Rostova", email: "elena@example.com", value: 340.0, date: "6 hours ago", status: "EMAIL 1 SENT" },
];
