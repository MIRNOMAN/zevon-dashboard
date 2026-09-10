import { baseApi, type ApiResponse } from "./baseApi";
import type { StoreItem, CreateStoreInput } from "@/types/stores";

export const storesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStores: builder.query<ApiResponse<StoreItem[]>, void>({
      query: () => "/stores",
    }),

    createStore: builder.mutation<ApiResponse<StoreItem>, CreateStoreInput>({
      query: (body) => ({
        url: "/stores",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetStoresQuery,
  useCreateStoreMutation,
} = storesApi;
