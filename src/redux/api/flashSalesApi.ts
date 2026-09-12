import { baseApi, type ApiResponse } from "./baseApi";
import type {
  FlashSaleItem,
  CreateFlashSaleInput,
  UpdateFlashSaleInput,
  FlashSaleQueryParams,
} from "@/types/flashSales";

export interface FlashSalesResponseData {
  campaigns: FlashSaleItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const flashSalesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getFlashSales: builder.query<
      ApiResponse<FlashSalesResponseData | FlashSaleItem[]>,
      FlashSaleQueryParams | void
    >({
      query: (params) => ({
        url: "/flash-sales/admin/all",
        params: params ? { ...params } : undefined,
      }),
      providesTags: ["Product"],
    }),

    getFlashSaleById: builder.query<ApiResponse<FlashSaleItem>, string>({
      query: (id) => `/flash-sales/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Product", id }],
    }),

    createFlashSale: builder.mutation<ApiResponse<FlashSaleItem>, CreateFlashSaleInput>({
      query: (body) => ({
        url: "/flash-sales",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    updateFlashSale: builder.mutation<
      ApiResponse<FlashSaleItem>,
      { id: string; data: UpdateFlashSaleInput }
    >({
      query: ({ id, data }) => ({
        url: `/flash-sales/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    toggleFlashSaleStatus: builder.mutation<ApiResponse<FlashSaleItem>, string>({
      query: (id) => ({
        url: `/flash-sales/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),

    deleteFlashSale: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/flash-sales/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetFlashSalesQuery,
  useGetFlashSaleByIdQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useToggleFlashSaleStatusMutation,
  useDeleteFlashSaleMutation,
} = flashSalesApi;

