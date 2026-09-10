import { baseApi, type ApiResponse } from "./baseApi";
import type {
  AbandonedCartsResponse,
  TriggerRecoveryResponse,
} from "@/types/abandonedCart";

export const abandonedCartApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAbandonedCarts: builder.query<
      ApiResponse<AbandonedCartsResponse>,
      void
    >({
      query: () => "/abandoned-carts",
      providesTags: ["Order", "Analytics"],
    }),

    triggerAbandonedRecovery: builder.mutation<
      ApiResponse<TriggerRecoveryResponse>,
      void
    >({
      query: () => ({
        url: "/abandoned-carts/trigger-recovery",
        method: "POST",
      }),
      invalidatesTags: ["Order", "Analytics", "Coupon"],
    }),
  }),
});

export const {
  useGetAbandonedCartsQuery,
  useTriggerAbandonedRecoveryMutation,
} = abandonedCartApi;
