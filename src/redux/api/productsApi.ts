import { baseApi, type ApiResponse } from "./baseApi";
import type {
  ProductItem,
  CreateProductInput,
  ProductQueryParams,
} from "@/types/products";

export const productsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminProducts: builder.query<
      ApiResponse<{ products: ProductItem[]; total: number } | ProductItem[]>,
      ProductQueryParams | void
    >({
      query: (params) => ({
        url: "/products/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Product"],
    }),

    getPublicProducts: builder.query<
      ApiResponse<{ products: ProductItem[]; total: number } | ProductItem[]>,
      void
    >({
      query: () => "/products",
      providesTags: ["Product"],
    }),

    getProductById: builder.query<ApiResponse<ProductItem>, string>({
      query: (id) => `/products/admin/${id}`,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<ApiResponse<ProductItem>, CreateProductInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    updateProduct: builder.mutation<
      ApiResponse<ProductItem>,
      { id: string; data: Partial<CreateProductInput> }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    togglePublishProduct: builder.mutation<ApiResponse<ProductItem>, string>({
      query: (id) => ({
        url: `/products/${id}/toggle-publish`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),

    toggleFeaturedProduct: builder.mutation<ApiResponse<ProductItem>, string>({
      query: (id) => ({
        url: `/products/${id}/toggle-featured`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    updateVariantStock: builder.mutation<
      ApiResponse<unknown>,
      { variantId: string; stock: number }
    >({
      query: ({ variantId, stock }) => ({
        url: `/products/variants/${variantId}/stock`,
        method: "PATCH",
        body: { stock },
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetPublicProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useTogglePublishProductMutation,
  useToggleFeaturedProductMutation,
  useDeleteProductMutation,
  useUpdateVariantStockMutation,
} = productsApi;
