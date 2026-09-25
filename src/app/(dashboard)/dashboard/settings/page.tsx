"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Save,
  Store,
  Mail,
  Phone,
  MapPin,
  Coins,
  Truck,
  BellRing,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/features/authSlice";
import {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
} from "@/redux/api/settingsApi";
import { getErrorMessage } from "@/lib/utils";

export default function SettingsPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: settingsRes, isLoading, refetch } = useGetStoreSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateStoreSettingsMutation();

  // Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const [formData, setFormData] = useState({
    storeBrandName: "ZEVON Luxury Retail",
    supportEmail: "concierge@zevon.com",
    supportPhone: "+1 (800) 555-ZEVON",
    address: "Avenue Montaigne, 75008 Paris, France",
    defaultCurrency: "USD",
    freeShippingThreshold: 500,
    enableStockAlerts: true,
    enableGuestCheckout: true,
    metaTitle: "ZEVON | Haute Couture & Luxury Streetwear",
    metaDescription: "Discover the latest haute couture, heavy fleece archives, and avant-garde luxury apparel.",
  });

  useEffect(() => {
    if (settingsRes?.data) {
      setFormData({
        storeBrandName: settingsRes.data.storeBrandName || "ZEVON Luxury Retail",
        supportEmail: settingsRes.data.supportEmail || "concierge@zevon.com",
        supportPhone: settingsRes.data.supportPhone || "+1 (800) 555-ZEVON",
        address: settingsRes.data.address || "Avenue Montaigne, 75008 Paris, France",
        defaultCurrency: settingsRes.data.defaultCurrency || "USD",
        freeShippingThreshold: settingsRes.data.freeShippingThreshold ?? 500,
        enableStockAlerts: settingsRes.data.enableStockAlerts ?? true,
        enableGuestCheckout: settingsRes.data.enableGuestCheckout ?? true,
        metaTitle: settingsRes.data.metaTitle || "ZEVON | Haute Couture & Luxury Streetwear",
        metaDescription: settingsRes.data.metaDescription || "Discover the latest haute couture, heavy fleece archives, and avant-garde luxury apparel.",
      });
    }
  }, [settingsRes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      showToast("success", "Store configuration saved successfully");
    } catch (err: unknown) {
      showToast("error", getErrorMessage(err, "Failed to update store settings"));
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>Store Settings & Configuration</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            General preferences, currency, API endpoints, and administrator profile
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="Refresh Settings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Brand Information */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Store className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">General Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Store Brand Name
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={formData.storeBrandName}
                onChange={(e) => setFormData({ ...formData, storeBrandName: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Support / Concierge Email
              </label>
              <input
                type="email"
                disabled={isLoading}
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Concierge Hotline / Phone
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Flagship Studio Address
              </label>
              <input
                type="text"
                disabled={isLoading}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics Settings */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Coins className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Currency & Commerce Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Default Currency Code
              </label>
              <select
                value={formData.defaultCurrency}
                disabled={isLoading}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Complimentary Shipping Threshold ($)
              </label>
              <input
                type="number"
                min="0"
                disabled={isLoading}
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl bg-zinc-950/80 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 cursor-pointer hover:border-white/10 transition">
              <input
                type="checkbox"
                checked={formData.enableStockAlerts}
                onChange={(e) => setFormData({ ...formData, enableStockAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:outline-none"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">Enable Low Stock Email Alerts</div>
                <div className="text-slate-400 text-[11px]">Notify admin when inventory drops under 5 units</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 cursor-pointer hover:border-white/10 transition">
              <input
                type="checkbox"
                checked={formData.enableGuestCheckout}
                onChange={(e) => setFormData({ ...formData, enableGuestCheckout: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:outline-none"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">Allow Guest Checkout</div>
                <div className="text-slate-400 text-[11px]">Permit orders without mandatory account signup</div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Bar */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-4 backdrop-blur-md flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Current Administrator: <span className="text-white font-semibold">{currentUser?.email || "abdullahalnoman1509@gmail.com"}</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
