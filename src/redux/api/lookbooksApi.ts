import { baseApi, type ApiResponse } from "./baseApi";
import type { LookbookItem, CreateLookbookInput } from "@/types/lookbooks";

export const lookbooksApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getLookbooks: builder.query<
      ApiResponse<{ lookbooks: LookbookItem[]; total: number } | LookbookItem[]>,
      void
    >({
      query: () => "/lookbooks",
    }),

    createLookbook: builder.mutation<ApiResponse<LookbookItem>, CreateLookbookInput>({
      query: (body) => ({
        url: "/lookbooks",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetLookbooksQuery,
  useCreateLookbookMutation,
} = lookbooksApi;
