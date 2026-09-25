import { baseApi, type ApiResponse } from "./baseApi";
import type { StoreItem, CreateStoreInput, UpdateStoreInput } from "@/types/stores";

export const storesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getStores: builder.query<ApiResponse<StoreItem[]>, void>({
      query: () => "/stores",
      providesTags: ["Stores"],
    }),

    getStoreById: builder.query<ApiResponse<StoreItem>, string>({
      query: (id) => `/stores/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Stores", id }],
    }),

    createStore: builder.mutation<ApiResponse<StoreItem>, CreateStoreInput>({
      query: (body) => ({
        url: "/stores",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stores"],
    }),

    updateStore: builder.mutation<ApiResponse<StoreItem>, UpdateStoreInput>({
      query: ({ id, data }) => ({
        url: `/stores/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Stores"],
    }),

    deleteStore: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (id) => ({
        url: `/stores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stores"],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storesApi;
