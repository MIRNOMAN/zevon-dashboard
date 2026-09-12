import { baseApi, type ApiResponse } from "./baseApi";
import type { ReviewAdminItem, ReviewQueryParams } from "@/types/reviews";

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  images?: string[];
}

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

    createReview: builder.mutation<ApiResponse<{ review: ReviewAdminItem }>, CreateReviewInput>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review", "Product"],
    }),

    updateReview: builder.mutation<
      ApiResponse<{ review: ReviewAdminItem }>,
      { id: string; data: UpdateReviewInput }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Review", "Product"],
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
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
