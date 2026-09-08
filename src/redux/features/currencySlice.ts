import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface CurrencyState {
  activeCurrency: string;
  baseCurrency: string;
  symbols: Record<string, string>;
  ratesFromBDT: Record<string, number>;
  names: Record<string, string>;
  lastUpdated: string | null;
}

const initialState: CurrencyState = {
  activeCurrency: "USD",
  baseCurrency: "BDT",
  symbols: {
    USD: "$",
    BDT: "৳",
    EUR: "€",
    GBP: "£",
  },
  ratesFromBDT: {
    BDT: 1.0,
    USD: 0.0084,
    EUR: 0.0078,
    GBP: 0.0066,
  },
  names: {
    USD: "US Dollar",
    BDT: "Bangladeshi Taka",
    EUR: "Euro",
    GBP: "British Pound",
  },
  lastUpdated: null,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    initializeCurrency: (state) => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("zevon_active_currency");
        if (saved && state.ratesFromBDT[saved]) {
          state.activeCurrency = saved;
        }
      }
    },
    setActiveCurrency: (state, action: PayloadAction<string>) => {
      const code = action.payload.toUpperCase();
      state.activeCurrency = code;
      if (typeof window !== "undefined") {
        localStorage.setItem("zevon_active_currency", code);
      }
    },
    setCurrencyRates: (
      state,
      action: PayloadAction<{
        baseCurrency?: string;
        supportedCurrencies?: Array<{
          code: string;
          symbol: string;
          name: string;
          rateFromBDT: number;
        }>;
        lastUpdated?: string;
      }>
    ) => {
      if (action.payload.supportedCurrencies) {
        action.payload.supportedCurrencies.forEach((c) => {
          state.ratesFromBDT[c.code] = c.rateFromBDT;
          state.symbols[c.code] = c.symbol;
          state.names[c.code] = c.name;
        });
      }
      if (action.payload.baseCurrency) {
        state.baseCurrency = action.payload.baseCurrency;
      }
      if (action.payload.lastUpdated) {
        state.lastUpdated = action.payload.lastUpdated;
      }
    },
  },
});

export const { initializeCurrency, setActiveCurrency, setCurrencyRates } =
  currencySlice.actions;

export const selectActiveCurrency = (state: RootState) =>
  state.currency.activeCurrency;
export const selectCurrencySymbols = (state: RootState) =>
  state.currency.symbols;
export const selectRatesFromBDT = (state: RootState) =>
  state.currency.ratesFromBDT;
export const selectCurrencyState = (state: RootState) => state.currency;

export default currencySlice.reducer;
