import { baseApi, type ApiResponse } from "./baseApi";
import type { BannerItem, CreateBannerInput } from "@/types/banners";

export const bannersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBanners: builder.query<ApiResponse<BannerItem[]>, { placement?: string } | void>({
      query: (params) => ({
        url: "/banners",
        params: params ?? undefined,
      }),
      providesTags: ["Banner"],
    }),

    getAdminBanners: builder.query<
      ApiResponse<{ banners: BannerItem[]; total: number } | BannerItem[]>,
      { page?: number; limit?: number; placement?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/banners/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Banner"],
    }),

    createBanner: builder.mutation<ApiResponse<BannerItem>, CreateBannerInput>({
      query: (body) => ({
        url: "/banners",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Banner"],
    }),

    updateBanner: builder.mutation<
      ApiResponse<BannerItem>,
      { id: string; data: Partial<CreateBannerInput> }
    >({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),

    deleteBanner: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),

    toggleBannerStatus: builder.mutation<ApiResponse<BannerItem>, string>({
      query: (id) => ({
        url: `/banners/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
} = bannersApi;
