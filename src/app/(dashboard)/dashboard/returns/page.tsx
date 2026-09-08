"use client";

import React from "react";
import { RotateCcw, Check, X } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-amber-400" />
            <span>Returns & Refund Inquiries</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Review customer return claims, approve refunds and generate reverse-logistics labels
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-3">Return ID</th>
              <th className="py-3 px-3">Order #</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Reason</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {mockReturns.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3 font-mono font-bold text-white">{r.id}</td>
                <td className="py-3.5 px-3 font-mono text-slate-400">{r.orderNumber}</td>
                <td className="py-3.5 px-3 font-semibold text-white">{r.customer}</td>
                <td className="py-3.5 px-3 text-slate-300">{r.reason}</td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold">
                      Approve
                    </button>
                    <button className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[11px] font-bold">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mockReturns = [
  { id: "RET-104", orderNumber: "ZEV-89420", customer: "Liam Hemsworth", reason: "Size too large (Exchange requested)", status: "REQUESTED" },
  { id: "RET-103", orderNumber: "ZEV-88219", customer: "Clara Bow", reason: "Fabric shade differs from monitor", status: "REQUESTED" },
];
