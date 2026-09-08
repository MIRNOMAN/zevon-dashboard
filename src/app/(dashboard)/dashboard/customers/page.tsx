"use client";

import React from "react";
import { Users, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useGetUsersQuery, type UserDirectoryItem } from "@/redux/api/dashboardApi";

export default function CustomersPage() {
  const { data: res, isLoading } = useGetUsersQuery();

  const rawData = res?.data;
  let users: UserDirectoryItem[] = [];
  if (Array.isArray(rawData)) {
    users = rawData;
  } else if (rawData && "users" in rawData) {
    users = rawData.users;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Customer Directory & Users</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live registered user accounts from /users ({users.length} accounts loaded)
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching users from zevon-server...</span>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {u.phone || "N/A"}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
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
            <p>No user accounts found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
