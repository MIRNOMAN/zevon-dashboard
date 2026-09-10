// ---------------------------------------------------------------------------
// Currency & Multi-Forex Types
// ---------------------------------------------------------------------------

export interface CurrencyMetadata {
  code: string;
  symbol: string;
  name: string;
  rateFromBDT: number;
  rateToBDT: number;
  decimalPlaces: number;
}

export interface CurrencyRatesResponse {
  baseCurrency: string;
  baseSymbol: string;
  supportedCurrencies: CurrencyMetadata[];
  lastUpdated: string;
}

export interface CurrencyConvertResponse {
  originalAmount: number;
  fromCurrency: string;
  fromSymbol: string;
  convertedAmount: number;
  toCurrency: string;
  toSymbol: string;
  formatted: string;
  exchangeRate: number;
}

export interface CurrencyDetectResponse {
  detectedCountry: string;
  countryName: string;
  recommendedCurrency: string;
  symbol: string;
  currencyName: string;
  exchangeRateFromBDT: number;
}

export interface UpdateRatesInput {
  USD?: number;
  EUR?: number;
  GBP?: number;
  [key: string]: number | undefined;
}
