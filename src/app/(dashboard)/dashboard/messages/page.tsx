"use client";

import React from "react";
import { MessageSquare, Send } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span>Customer Chat & Inquiries</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time chat socket integration from /chat and /contact inquiries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[560px]">
        {/* Thread List */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-4 backdrop-blur-md overflow-y-auto space-y-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Sophia Loren</span>
              <span className="text-[10px] text-amber-400">Just now</span>
            </div>
            <p className="text-xs text-slate-400 truncate">Can you confirm when the bespoke blazer will dispatch?</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 cursor-pointer hover:bg-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Lucas Scott</span>
              <span className="text-[10px] text-slate-500">2h ago</span>
            </div>
            <p className="text-xs text-slate-400 truncate">Inquiring about leather shoe sizing chart in Europe.</p>
          </div>
        </div>

        {/* Active Chat Conversation */}
        <div className="md:col-span-2 rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md flex flex-col justify-between">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">Sophia Loren</h3>
              <p className="text-[10px] text-slate-400">VIP Customer • Order #ZEV-89421</p>
            </div>
          </div>

          <div className="space-y-3 my-4 overflow-y-auto flex-1 text-xs">
            <div className="p-3 rounded-xl bg-zinc-800/80 max-w-sm text-slate-200">
              Hello! Can you confirm when the bespoke blazer will dispatch to London?
            </div>
            <div className="p-3 rounded-xl bg-amber-500 text-black font-medium max-w-sm ml-auto">
              Good day Sophia! Your tailored order is currently in final pressing and will dispatch via DHL Express tomorrow morning.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <input
              type="text"
              placeholder="Type your response to customer..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
