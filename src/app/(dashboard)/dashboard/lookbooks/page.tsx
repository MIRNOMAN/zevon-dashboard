"use client";

import React from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useGetLookbooksQuery, type LookbookItem } from "@/redux/api/dashboardApi";

export default function LookbooksPage() {
  const { data: res, isLoading } = useGetLookbooksQuery();

  const rawData = res?.data;
  let lookbooks: LookbookItem[] = [];
  if (Array.isArray(rawData)) {
    lookbooks = rawData;
  } else if (rawData && "lookbooks" in rawData) {
    lookbooks = rawData.lookbooks;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Shoppable Lookbooks</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Interactive editorial campaigns with tagged shoppable hot-spot coordinate overlays
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching lookbooks from backend...</span>
          </div>
        ) : lookbooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lookbooks.map((lb) => (
              <div
                key={lb.id}
                className="group rounded-2xl bg-zinc-950/70 border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all space-y-3"
              >
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                  {lb.imageUrl ? (
                    <img
                      src={lb.imageUrl}
                      alt={lb.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}
                  {lb.season && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                      {lb.season}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {lb.title}
                  </h3>
                  {lb.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{lb.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No lookbooks published yet. Create editorial collections on backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}
