"use client";

import React from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useGetBannersQuery, type BannerItem } from "@/redux/api/dashboardApi";

export default function BannersPage() {
  const { data: res, isLoading } = useGetBannersQuery();
  const banners: BannerItem[] = res?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-amber-400" />
            <span>Promotional Banners & Sliders</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Live banners from /banners ({banners.length} banners loaded)
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Fetching promotional banners...</span>
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md space-y-4"
            >
              <div className="h-44 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 relative">
                {b.imageUrl ? (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    No image provided
                  </div>
                )}
                {b.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black shadow-md">
                    {b.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-bold text-white text-sm">{b.title}</h3>
                  <span className="text-emerald-400 font-medium text-[11px]">
                    {b.placement}
                  </span>
                </div>
                {b.subtitle && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {b.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-white/10 text-center text-xs text-slate-400">
          No hero banners configured in database.
        </div>
      )}
    </div>
  );
}
