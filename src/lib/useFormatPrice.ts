"use client";

import { useAppSelector } from "@/redux/hooks";
import {
  selectActiveCurrency,
  selectCurrencySymbols,
  selectRatesFromBDT,
} from "@/redux/features/currencySlice";

/**
 * Hook to convert and format any base price (default USD base) into the user's active selected currency.
 */
export function useFormatPrice() {
  const activeCurrency = useAppSelector(selectActiveCurrency);
  const symbols = useAppSelector(selectCurrencySymbols);
  const rates = useAppSelector(selectRatesFromBDT);

  const format = (rawPrice: unknown): string => {
    if (rawPrice === null || rawPrice === undefined) return `${symbols[activeCurrency] || "$"}0.00`;

    let num = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice));
    if (isNaN(num)) return `${symbols[activeCurrency] || "$"}0.00`;

    const usdRate = rates["USD"] || 0.0084;
    const targetRate = rates[activeCurrency] || usdRate;
    const symbol = symbols[activeCurrency] || "$";

    // Convert assuming rawPrice is in USD base
    const amountInBdt = num / usdRate;
    const converted = activeCurrency === "USD" ? num : amountInBdt * targetRate;

    return `${symbol}${converted.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${activeCurrency !== "USD" ? activeCurrency : ""}`.trim();
  };

  return { format, activeCurrency, symbol: symbols[activeCurrency] || "$" };
}
