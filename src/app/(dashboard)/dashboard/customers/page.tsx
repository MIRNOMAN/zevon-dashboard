"use client";

import React from "react";
import { Users, Search, ShieldCheck } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Customer Directory & Users</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            View customer purchase histories, manage administrator permissions and roles
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Orders</th>
              <th className="py-3 px-3">Total Spent</th>
              <th className="py-3 px-3">Account Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {customers.map((c) => (
              <tr key={c.email} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-500">{c.email}</div>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.role}
                  </span>
                </td>
                <td className="py-3.5 px-3 font-mono">{c.orders} orders</td>
                <td className="py-3.5 px-3 font-bold text-white">${c.spent.toFixed(2)}</td>
                <td className="py-3.5 px-3">
                  <span className="text-emerald-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Verified Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const customers = [
  { name: "Abdullah Al Noman", email: "abdullahalnoman1509@gmail.com", role: "ADMIN", orders: 12, spent: 4320.0 },
  { name: "Sophia Loren", email: "sophia@example.com", role: "CUSTOMER", orders: 8, spent: 2150.0 },
  { name: "Liam Hemsworth", email: "liam@example.com", role: "CUSTOMER", orders: 4, spent: 890.0 },
];
