import { baseApi, type ApiResponse } from "./baseApi";
import type { CouponItem, CreateCouponInput } from "@/types/coupons";

export const couponsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCoupons: builder.query<
      ApiResponse<{ coupons: CouponItem[]; total: number } | CouponItem[]>,
      void
    >({
      query: () => "/coupons",
      providesTags: ["Coupon"],
    }),

    createCoupon: builder.mutation<ApiResponse<CouponItem>, CreateCouponInput>({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    updateCoupon: builder.mutation<
      ApiResponse<CouponItem>,
      { id: string; data: Partial<CreateCouponInput> }
    >({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),

    deleteCoupon: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),

    toggleCouponStatus: builder.mutation<ApiResponse<CouponItem>, string>({
      query: (id) => ({
        url: `/coupons/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
} = couponsApi;
