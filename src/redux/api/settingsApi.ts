import { baseApi, ApiResponse } from "./baseApi";

export interface StoreSettings {
  storeBrandName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  defaultCurrency: string;
  freeShippingThreshold: number;
  taxRatePercent: number;
  enableStockAlerts: boolean;
  enableGuestCheckout: boolean;
  metaTitle: string;
  metaDescription: string;
  updatedAt?: string;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query<ApiResponse<StoreSettings>, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    updateStoreSettings: builder.mutation<ApiResponse<StoreSettings>, Partial<StoreSettings>>({
      query: (body) => ({
        url: "/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
} = settingsApi;
