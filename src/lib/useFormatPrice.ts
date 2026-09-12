"use client";

import { useAppSelector } from "@/redux/hooks";
import {
  selectActiveCurrency,
  selectCurrencySymbols,
  selectRatesFromBDT,
} from "@/redux/features/currencySlice";

/**
 * Hook to convert and format any base price into the user's active selected currency in real-time.
 */
export function useFormatPrice() {
  const activeCurrency = useAppSelector(selectActiveCurrency);
  const symbols = useAppSelector(selectCurrencySymbols);
  const rates = useAppSelector(selectRatesFromBDT);

  const format = (rawPrice: unknown): string => {
    const symbol = symbols[activeCurrency] || "$";
    if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
      return `${symbol}0.00`;
    }

    let num = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice));
    if (isNaN(num)) return `${symbol}0.00`;

    const usdRate = rates["USD"] || 0.0084;
    const targetRate = rates[activeCurrency] || usdRate;

    // Convert assuming stored rawPrice is in USD base
    const amountInBdt = num / usdRate;
    const converted = activeCurrency === "USD" ? num : amountInBdt * targetRate;

    return `${symbol}${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return { format, activeCurrency, symbol: symbols[activeCurrency] || "$" };
}
