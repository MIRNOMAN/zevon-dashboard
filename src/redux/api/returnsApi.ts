import { baseApi, type ApiResponse } from "./baseApi";
import type {
  ReturnRequestItem,
  ReturnsResponse,
  ReturnQueryParams,
  ApproveReturnInput,
  RejectReturnInput,
  ReceiveReturnInput,
  RefundReturnInput,
  UpdateReturnStatusInput,
} from "@/types/returns";

export const returnsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getReturns: builder.query<
      ApiResponse<ReturnsResponse | ReturnRequestItem[]>,
      ReturnQueryParams | void
    >({
      query: (params) => ({
        url: "/returns",
        params: params ?? undefined,
      }),
      providesTags: ["Order"],
    }),

    getReturnById: builder.query<ApiResponse<ReturnRequestItem>, string>({
      query: (id) => `/returns/${id}`,
      providesTags: ["Order"],
    }),

    updateReturnStatus: builder.mutation<
      ApiResponse<ReturnRequestItem>,
      { id: string; data: UpdateReturnStatusInput }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),

    approveReturn: builder.mutation<
      ApiResponse<ReturnRequestItem>,
      { id: string; data?: ApproveReturnInput }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}/approve`,
        method: "PATCH",
        body: data || {},
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),

    rejectReturn: builder.mutation<
      ApiResponse<ReturnRequestItem>,
      { id: string; data: RejectReturnInput }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}/reject`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),

    receiveReturn: builder.mutation<
      ApiResponse<ReturnRequestItem>,
      { id: string; data?: ReceiveReturnInput }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}/receive`,
        method: "PATCH",
        body: data || {},
      }),
      invalidatesTags: ["Order", "Product", "Analytics"],
    }),

    refundReturn: builder.mutation<
      ApiResponse<ReturnRequestItem>,
      { id: string; data?: RefundReturnInput }
    >({
      query: ({ id, data }) => ({
        url: `/returns/${id}/refund`,
        method: "PATCH",
        body: data || {},
      }),
      invalidatesTags: ["Order", "Analytics"],
    }),
  }),
});

export const {
  useGetReturnsQuery,
  useGetReturnByIdQuery,
  useUpdateReturnStatusMutation,
  useApproveReturnMutation,
  useRejectReturnMutation,
  useReceiveReturnMutation,
  useRefundReturnMutation,
} = returnsApi;
