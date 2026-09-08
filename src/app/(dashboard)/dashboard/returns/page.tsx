"use client";

import React, { useState } from "react";
import { RotateCcw, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  type ReturnItem,
} from "@/redux/api/dashboardApi";

export default function ReturnsPage() {
  const { data: res, isLoading } = useGetReturnsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReturnStatusMutation();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const rawData = res?.data;
  let returns: ReturnItem[] = [];
  if (Array.isArray(rawData)) {
    returns = rawData;
  } else if (rawData && "returns" in rawData) {
    returns = rawData.returns;
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      setFeedbackMessage(`Return status updated to ${status}.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      alert("Failed to update return status.");
    }
  };

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

      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching return claims from backend...</span>
          </div>
        ) : returns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Return ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-white">{r.id.slice(0, 8)}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white">{r.user?.name || "Customer"}</div>
                      <div className="text-[10px] text-slate-500">{r.user?.email || "verified"}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 max-w-xs truncate">{r.reason}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : r.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "REQUESTED" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(r.id, "APPROVED")}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(r.id, "REJECTED")}
                              disabled={isUpdating}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-[11px] font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No return claims filed yet. Return requests from customers will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
