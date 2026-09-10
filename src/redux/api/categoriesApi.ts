import { baseApi, type ApiResponse } from "./baseApi";
import type {
  CategoryItem,
  CategoryAdminResponse,
  CreateCategoryInput,
  CategoryQueryParams,
} from "@/types/categories";

export const categoriesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    getAdminCategories: builder.query<
      ApiResponse<CategoryAdminResponse | CategoryItem[]>,
      CategoryQueryParams | void
    >({
      query: (params) => ({
        url: "/categories/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Category"],
    }),

    getCategoryTree: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => "/categories/tree",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<ApiResponse<CategoryItem>, CreateCategoryInput>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      ApiResponse<CategoryItem>,
      { id: string; data: Partial<CreateCategoryInput> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    toggleCategoryStatus: builder.mutation<ApiResponse<CategoryItem>, string>({
      query: (id) => ({
        url: `/categories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
} = categoriesApi;
