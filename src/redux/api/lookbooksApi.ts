import { baseApi, type ApiResponse } from "./baseApi";
import type {
  LookbookItem,
  LookbookAdminResponse,
  CreateLookbookInput,
  LookbookQueryParams,
} from "@/types/lookbooks";

export const lookbooksApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLookbooks: builder.query<
      ApiResponse<LookbookAdminResponse | LookbookItem[]>,
      LookbookQueryParams | void
    >({
      query: (params) => ({
        url: "/lookbooks",
        params: params ?? undefined,
      }),
      providesTags: ["Product"],
    }),

    getAdminLookbooks: builder.query<
      ApiResponse<LookbookAdminResponse | LookbookItem[]>,
      LookbookQueryParams | void
    >({
      query: (params) => ({
        url: "/lookbooks/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Product"],
    }),

    getLookbookById: builder.query<ApiResponse<LookbookItem>, string>({
      query: (id) => `/lookbooks/${id}`,
      providesTags: ["Product"],
    }),

    getLookbookBySlug: builder.query<ApiResponse<LookbookItem>, string>({
      query: (slug) => `/lookbooks/slug/${slug}`,
      providesTags: ["Product"],
    }),

    createLookbook: builder.mutation<ApiResponse<LookbookItem>, CreateLookbookInput>({
      query: (body) => ({
        url: "/lookbooks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    updateLookbook: builder.mutation<
      ApiResponse<LookbookItem>,
      { id: string; data: Partial<CreateLookbookInput> }
    >({
      query: ({ id, data }) => ({
        url: `/lookbooks/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteLookbook: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/lookbooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    toggleLookbookStatus: builder.mutation<ApiResponse<LookbookItem>, string>({
      query: (id) => ({
        url: `/lookbooks/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetLookbooksQuery,
  useGetAdminLookbooksQuery,
  useGetLookbookByIdQuery,
  useGetLookbookBySlugQuery,
  useCreateLookbookMutation,
  useUpdateLookbookMutation,
  useDeleteLookbookMutation,
  useToggleLookbookStatusMutation,
} = lookbooksApi;
