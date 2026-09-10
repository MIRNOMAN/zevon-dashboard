import { baseApi, type ApiResponse } from "./baseApi";
import type { OrderItem, ReturnItem } from "@/types/orders";

export const ordersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminOrders: builder.query<
      ApiResponse<{ orders: OrderItem[]; total: number } | OrderItem[]>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/orders",
        params: params ?? undefined,
      }),
      providesTags: ["Order"],
    }),

    getOrderMetrics: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => "/orders/metrics/summary",
      providesTags: ["Order"],
    }),

    getReturns: builder.query<
      ApiResponse<{ returns: ReturnItem[]; total: number } | ReturnItem[]>,
      void
    >({
      query: () => "/returns",
      providesTags: ["Order"],
    }),

    updateReturnStatus: builder.mutation<
      ApiResponse<ReturnItem>,
      { id: string; status: string; adminNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/returns/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    getAbandonedCarts: builder.query<ApiResponse<unknown>, void>({
      query: () => "/abandoned-carts/summary",
    }),
  }),
});

export const {
  useGetAdminOrdersQuery,
  useGetOrderMetricsQuery,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetAbandonedCartsQuery,
} = ordersApi;
