import { baseApi, type ApiResponse } from "./baseApi";
import type { FlashSaleItem, CreateFlashSaleInput } from "@/types/flashSales";

export const flashSalesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getFlashSales: builder.query<
      ApiResponse<{ flashSales: FlashSaleItem[]; total: number } | FlashSaleItem[]>,
      void
    >({
      query: () => "/flash-sales/admin/all",
      providesTags: ["Product"],
    }),

    createFlashSale: builder.mutation<ApiResponse<FlashSaleItem>, CreateFlashSaleInput>({
      query: (body) => ({
        url: "/flash-sales",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetFlashSalesQuery,
  useCreateFlashSaleMutation,
} = flashSalesApi;
