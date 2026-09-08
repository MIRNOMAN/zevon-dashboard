"use client";

import React, { useState } from "react";
import {
  Coins,
  ArrowRightLeft,
  Globe2,
  TrendingUp,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
} from "lucide-react";
import {
  useGetCurrencyRatesQuery,
  useLazyConvertCurrencyQuery,
  useDetectCurrencyMutation,
  useUpdateCurrencyRatesMutation,
  type CurrencyMetadata,
} from "@/redux/api/dashboardApi";

export default function CurrencyForexPage() {
  const { data: ratesRes, isLoading: isRatesLoading, refetch } = useGetCurrencyRatesQuery();
  const [triggerConvert, { data: convertRes, isFetching: isConverting }] = useLazyConvertCurrencyQuery();
  const [triggerDetect, { data: detectRes, isLoading: isDetecting }] = useDetectCurrencyMutation();
  const [updateRates, { isLoading: isUpdatingRates }] = useUpdateCurrencyRatesMutation();

  // Converter Form State
  const [convertAmount, setConvertAmount] = useState<string>("100");
  const [convertFrom, setConvertFrom] = useState<string>("USD");
  const [convertTo, setConvertTo] = useState<string>("BDT");

  // Rate Editing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [usdRate, setUsdRate] = useState<string>("0.0084");
  const [eurRate, setEurRate] = useState<string>("0.0078");
  const [gbpRate, setGbpRate] = useState<string>("0.0066");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ratesData = ratesRes?.data;
  const currencies: CurrencyMetadata[] = ratesData?.supportedCurrencies || [];

  // Handle Convert
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(convertAmount);
    if (isNaN(num) || num <= 0) return;
    await triggerConvert({ amount: num, from: convertFrom, to: convertTo });
  };

  // Handle Detect
  const handleDetect = async () => {
    try {
      await triggerDetect().unwrap();
      setStatusMessage("Geo-location currency successfully detected from client headers!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      // Handled
    }
  };

  // Open Edit Modal with current rates
  const handleOpenEdit = () => {
    const usd = currencies.find((c) => c.code === "USD")?.rateFromBDT;
    const eur = currencies.find((c) => c.code === "EUR")?.rateFromBDT;
    const gbp = currencies.find((c) => c.code === "GBP")?.rateFromBDT;
    if (usd) setUsdRate(String(usd));
    if (eur) setEurRate(String(eur));
    if (gbp) setGbpRate(String(gbp));
    setIsEditModalOpen(true);
  };

  // Submit Updated Rates
  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRates({
        USD: parseFloat(usdRate) || undefined,
        EUR: parseFloat(eurRate) || undefined,
        GBP: parseFloat(gbpRate) || undefined,
      }).unwrap();
      setIsEditModalOpen(false);
      setStatusMessage("Exchange conversion rates updated successfully across the platform!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      alert("Failed to update exchange rates.");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-400" />
            <span>Smart Currency & Forex Engine</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Multi-currency live exchange pricing (Base: BDT), real-time conversion API, and geo-IP detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title="Refresh Rates"
          >
            <RefreshCw className={`w-4 h-4 ${isRatesLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Edit Forex Rates</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── Live Rates Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isRatesLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 animate-pulse h-32"
            />
          ))
        ) : (
          currencies.map((curr) => (
            <div
              key={curr.code}
              className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md relative overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 font-mono text-sm">
                    {curr.symbol}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{curr.code}</h3>
                    <p className="text-[10px] text-slate-400">{curr.name}</p>
                  </div>
                </div>
                {curr.code === "BDT" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    BASE
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">1 BDT in {curr.code}</span>
                  <span className="font-mono font-bold text-white">{curr.rateFromBDT}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">1 {curr.code} in BDT</span>
                  <span className="font-mono font-bold text-emerald-400">৳{curr.rateToBDT}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Real-time Converter & IP Detector ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Converter Calculator */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Live Currency Converter</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time calculation computed instantly via backend `/currency/convert` API
          </p>

          <form onSubmit={handleConvert} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Amount to Convert</label>
              <input
                type="number"
                step="any"
                required
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">From Currency</label>
                <select
                  value={convertFrom}
                  onChange={(e) => setConvertFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {["USD", "BDT", "EUR", "GBP"].map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">To Currency</label>
                <select
                  value={convertTo}
                  onChange={(e) => setConvertTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {["BDT", "USD", "EUR", "GBP"].map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isConverting}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Calculate Exchange</span>
                </>
              )}
            </button>
          </form>

          {/* Conversion Output */}
          {convertRes?.data && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2 animate-in fade-in">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                Live Conversion Result
              </span>
              <div className="text-xl font-black text-white font-mono">
                {convertRes.data.formatted}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                <span>Rate Applied:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  1 {convertRes.data.fromCurrency} = {convertRes.data.exchangeRate}{" "}
                  {convertRes.data.toCurrency}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Geo-Location IP Auto-Detection */}
        <div className="rounded-2xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Geo-IP Location Detection</h2>
            </div>
            <p className="text-xs text-slate-400">
              Inspects incoming client HTTP headers (Cloudflare, X-Forwarded-For, Remote IP) to automatically detect visitor country and apply the appropriate currency.
            </p>

            <button
              onClick={handleDetect}
              disabled={isDetecting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all active:scale-95"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Detecting Geo-Location...</span>
                </>
              ) : (
                <>
                  <Globe2 className="w-4 h-4 text-amber-400" />
                  <span>Test Geo-Detection Header</span>
                </>
              )}
            </button>

            {detectRes?.data && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {detectRes.data.countryName} ({detectRes.data.detectedCountry})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    DETECTED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Recommended Currency</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {detectRes.data.symbol} {detectRes.data.recommendedCurrency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Currency Name</span>
                    <span className="text-slate-300 font-medium">
                      {detectRes.data.currencyName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              All customer storefront prices automatically sync with these live exchange conversion factors.
            </span>
          </div>
        </div>
      </div>

      {/* ── Edit Rates Modal ───────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Update Exchange Rates (Base: 1 BDT)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide how many foreign currency units equal 1 Bangladeshi Taka (BDT).
            </p>

            <form onSubmit={handleSaveRates} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 block font-semibold">USD Rate (1 BDT in USD)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block font-semibold">EUR Rate (1 BDT in EUR)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={eurRate}
                  onChange={(e) => setEurRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 block font-semibold">GBP Rate (1 BDT in GBP)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={gbpRate}
                  onChange={(e) => setGbpRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRates}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingRates ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Rates</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
