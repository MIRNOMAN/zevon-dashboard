import { baseApi } from "./baseApi";
import type { Product, ProductListResponse, CreateProductInput } from "@/features/products";

// ---------------------------------------------------------------------------
// Product API — CRUD endpoints
// ---------------------------------------------------------------------------

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, { page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: "/products",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: "Product", id: slug }],
    }),

    createProduct: builder.mutation<Product, CreateProductInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<Product, { slug: string; data: Partial<CreateProductInput> }>({
      query: ({ slug, data }) => ({
        url: `/products/${slug}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: "Product", id: slug },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (slug) => ({
        url: `/products/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, slug) => [
        { type: "Product", id: slug },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

// ---------------------------------------------------------------------------
// Auto-generated hooks
// ---------------------------------------------------------------------------

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
