import { baseApi, type ApiResponse } from "./baseApi";
import type {
  CouponItem,
  CreateCouponInput,
  UpdateCouponInput,
} from "@/types/coupons";

export interface CouponsQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export interface CouponsResponseData {
  coupons: CouponItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const couponsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCoupons: builder.query<
      ApiResponse<CouponsResponseData | CouponItem[]>,
      CouponsQueryParams | void
    >({
      query: (params) => ({
        url: "/coupons",
        params: params ? { ...params } : undefined,
      }),
      providesTags: ["Coupon"],
    }),

    getCouponById: builder.query<ApiResponse<CouponItem>, string>({
      query: (id) => `/coupons/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Coupon", id }],
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
      { id: string; data: UpdateCouponInput }
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
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useToggleCouponStatusMutation,
} = couponsApi;
