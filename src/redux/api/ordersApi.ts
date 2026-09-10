import { baseApi, type ApiResponse } from "./baseApi";
import type {
  OrderItem,
  OrdersResponse,
  ReturnItem,
  OrderQueryParams,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  AssignCourierInput,
} from "@/types/orders";

export const ordersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminOrders: builder.query<
      ApiResponse<OrdersResponse | OrderItem[]>,
      OrderQueryParams | void
    >({
      query: (params) => ({
        url: "/orders",
        params: params ?? undefined,
      }),
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<ApiResponse<OrderItem>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<
      ApiResponse<OrderItem>,
      { id: string; data: UpdateOrderStatusInput }
    >({
      query: ({ id, data }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),

    updatePaymentStatus: builder.mutation<
      ApiResponse<OrderItem>,
      { id: string; data: UpdatePaymentStatusInput }
    >({
      query: ({ id, data }) => ({
        url: `/orders/${id}/payment-status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),

    assignCourier: builder.mutation<
      ApiResponse<OrderItem>,
      { id: string; data: AssignCourierInput }
    >({
      query: ({ id, data }) => ({
        url: `/orders/${id}/assign-courier`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    getOrderMetrics: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => "/orders/metrics/summary",
      providesTags: ["Order"],
    }),

    getOrderInvoice: builder.query<ApiResponse<unknown>, string>({
      query: (id) => `/orders/${id}/invoice`,
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
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useAssignCourierMutation,
  useGetOrderMetricsQuery,
  useGetOrderInvoiceQuery,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetAbandonedCartsQuery,
} = ordersApi;
