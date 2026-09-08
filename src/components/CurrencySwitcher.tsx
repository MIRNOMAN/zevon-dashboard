"use client";

import React, { useState, useEffect } from "react";
import { Coins, ChevronDown, Check, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectActiveCurrency,
  setActiveCurrency,
  setCurrencyRates,
  initializeCurrency,
} from "@/redux/features/currencySlice";
import { useGetCurrencyRatesQuery } from "@/redux/api/dashboardApi";

export default function CurrencySwitcher() {
  const dispatch = useAppDispatch();
  const activeCurrency = useAppSelector(selectActiveCurrency);
  const { data: res, isLoading } = useGetCurrencyRatesQuery();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    dispatch(initializeCurrency());
  }, [dispatch]);

  // Sync fetched rates into Redux
  useEffect(() => {
    if (res?.data) {
      dispatch(
        setCurrencyRates({
          baseCurrency: res.data.baseCurrency,
          supportedCurrencies: res.data.supportedCurrencies,
          lastUpdated: res.data.lastUpdated,
        })
      );
    }
  }, [res, dispatch]);

  const ratesData = res?.data;
  const currencies = ratesData?.supportedCurrencies || [
    { code: "USD", symbol: "$", name: "US Dollar", rateFromBDT: 0.0084, rateToBDT: 119.05, decimalPlaces: 2 },
    { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rateFromBDT: 1.0, rateToBDT: 1.0, decimalPlaces: 2 },
    { code: "EUR", symbol: "€", name: "Euro", rateFromBDT: 0.0078, rateToBDT: 128.2, decimalPlaces: 2 },
    { code: "GBP", symbol: "£", name: "British Pound", rateFromBDT: 0.0066, rateToBDT: 151.52, decimalPlaces: 2 },
  ];

  const handleSelect = (code: string) => {
    dispatch(setActiveCurrency(code));
    setIsOpen(false);
  };

  const fallbackMeta = {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rateFromBDT: 0.0084,
    rateToBDT: 119.05,
    decimalPlaces: 2,
  };

  const activeMeta = currencies.find((c) => c.code === activeCurrency) || fallbackMeta;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-amber-500/40 text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
        title="Active Currency Switcher"
      >
        <Coins className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-mono text-amber-400">{activeMeta.symbol}</span>
        <span>{activeMeta.code}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950 border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 flex items-center justify-between">
              <span>Exchange Currencies</span>
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
            </div>

            <div className="space-y-1 mt-1">
              {currencies.map((c) => {
                const isSelected = c.code === activeCurrency;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-400 font-bold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold w-4 text-center text-amber-400">
                        {c.symbol}
                      </span>
                      <div className="text-left">
                        <span className="block leading-tight">{c.code}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {c.name}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
