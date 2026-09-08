"use client";

import React, { useState } from "react";
import { Settings, Shield, Lock, Save } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/authSlice";

export default function SettingsPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [storeName, setStoreName] = useState("ZEVON Luxury Retail");
  const [supportEmail, setSupportEmail] = useState("concierge@zevon.com");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-400" />
          <span>Store Settings & Configuration</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          General preferences, currency, API endpoints, and administrator profile
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-6">
        <h2 className="text-base font-bold text-white">General Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Store Brand Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Support / Concierge Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Administrator: <span className="text-white font-semibold">{currentUser?.email || "admin@zevon.com"}</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
