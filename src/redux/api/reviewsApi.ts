import { baseApi, type ApiResponse } from "./baseApi";
import type { ReviewAdminItem, ReviewQueryParams } from "@/types/reviews";

export const reviewsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminReviews: builder.query<
      ApiResponse<{ reviews: ReviewAdminItem[]; meta?: { total: number; page: number; totalPages: number } } | ReviewAdminItem[]>,
      ReviewQueryParams | void
    >({
      query: (params) => ({
        url: "/reviews/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Review"],
    }),

    deleteReview: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Product"],
    }),
  }),
});

export const {
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
} = reviewsApi;
