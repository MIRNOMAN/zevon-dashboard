"use client";

import React, { useState } from "react";
import { Truck, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  type ShippingZoneItem,
} from "@/redux/api/dashboardApi";
import { useFormatPrice } from "@/lib/useFormatPrice";

export default function ShippingPage() {
  const { format: formatCurrency } = useFormatPrice();
  const { data: res, isLoading } = useGetShippingZonesQuery();
  const [createZone, { isLoading: isCreating }] = useCreateShippingZoneMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [cost, setCost] = useState("");
  const [expressCost, setExpressCost] = useState("");
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState("2-4 Business Days");

  const rawData = res?.data;
  let zones: ShippingZoneItem[] = [];
  if (Array.isArray(rawData)) {
    zones = rawData;
  } else if (rawData && "zones" in rawData) {
    zones = rawData.zones;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createZone({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        cost: parseFloat(cost) || 0,
        expressCost: expressCost ? parseFloat(expressCost) : undefined,
        estimatedDeliveryDays,
        isActive: true,
      }).unwrap();
      setIsModalOpen(false);
      setName("");
      setCode("");
      setCost("");
      setExpressCost("");
    } catch {
      alert("Failed to create shipping zone.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-amber-400" />
            <span>Shipping Zones & Couriers</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Configure domestic express, global air delivery rates, and courier logistics
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shipping Zone</span>
        </button>
      </div>

      <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-5 backdrop-blur-md">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading shipping zones from backend...</span>
          </div>
        ) : zones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-5 rounded-2xl bg-zinc-950/70 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h3 className="text-sm font-bold text-white">{zone.name}</h3>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {zone.code}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Standard Rate</span>
                    <span className="text-white font-bold">{formatCurrency(zone.cost)}</span>
                  </div>
                  {zone.expressCost && (
                    <div>
                      <span className="text-slate-500 block text-[10px]">Express Rate</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(zone.expressCost)}</span>
                    </div>
                  )}
                </div>

                {zone.estimatedDeliveryDays && (
                  <p className="text-[11px] text-slate-400 pt-1">
                    Estimated Timeframe: {zone.estimatedDeliveryDays}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
            <p>No shipping zones found. Click &quot;Add Shipping Zone&quot; to configure delivery rules.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Create Shipping Zone</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Domestic Dhaka Express"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BD-DHK"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Standard Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Delivery Timeframe</label>
                <input
                  type="text"
                  placeholder="1-2 Business Days"
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-50"
                >
                  {isCreating ? "Saving..." : "Save Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
