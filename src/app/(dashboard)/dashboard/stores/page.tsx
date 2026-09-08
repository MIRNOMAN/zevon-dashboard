"use client";

import React from "react";
import { Store, MapPin, Phone, Loader2, AlertCircle } from "lucide-react";
import { useGetStoresQuery, type StoreItem } from "@/redux/api/dashboardApi";

export default function StoresPage() {
  const { data: res, isLoading } = useGetStoresQuery();

  const rawData = res?.data;
  let stores: StoreItem[] = [];
  if (Array.isArray(rawData)) {
    stores = rawData;
  } else if (rawData && "stores" in rawData) {
    stores = (rawData as { stores: StoreItem[] }).stores;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Store className="w-6 h-6 text-amber-400" />
            <span>Physical Flagship Stores</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage flagship retail branches, in-store pickup reservations, and boutique hours
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading store branches from backend...</span>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{s.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {s.city}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{s.address}</p>

                {s.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{s.phone}</span>
                  </div>
                )}

                {s.openingHours && (
                  <p className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-white/5">
                    Hours: {s.openingHours}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No store locations found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
