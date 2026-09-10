import { baseApi, type ApiResponse } from "./baseApi";
import type {
  CurrencyRatesResponse,
  CurrencyConvertResponse,
  CurrencyDetectResponse,
  UpdateRatesInput,
} from "@/types/currency";

export const currencyApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCurrencyRates: builder.query<ApiResponse<CurrencyRatesResponse>, void>({
      query: () => "/currency/rates",
      providesTags: ["Analytics"],
    }),

    convertCurrency: builder.query<
      ApiResponse<CurrencyConvertResponse>,
      { amount: number; from?: string; to?: string }
    >({
      query: (params) => ({
        url: "/currency/convert",
        params,
      }),
    }),

    detectCurrency: builder.mutation<ApiResponse<CurrencyDetectResponse>, void>({
      query: () => ({
        url: "/currency/detect",
        method: "POST",
      }),
    }),

    updateCurrencyRates: builder.mutation<
      ApiResponse<CurrencyRatesResponse>,
      UpdateRatesInput
    >({
      query: (body) => ({
        url: "/currency/rates",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetCurrencyRatesQuery,
  useLazyConvertCurrencyQuery,
  useDetectCurrencyMutation,
  useUpdateCurrencyRatesMutation,
} = currencyApi;
