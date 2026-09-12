import { baseApi, type ApiResponse } from "./baseApi";
import type {
  GiftCardItem,
  CreateGiftCardInput,
  UpdateGiftCardInput,
  GiftCardQueryParams,
} from "@/types/giftCards";

export interface GiftCardsResponseData {
  giftCards: GiftCardItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const giftCardsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getGiftCards: builder.query<
      ApiResponse<GiftCardsResponseData>,
      GiftCardQueryParams | void
    >({
      query: (params) => ({
        url: "/gift-cards",
        params: params ? { ...params } : undefined,
      }),
      providesTags: ["GiftCard"],
    }),

    getGiftCardById: builder.query<ApiResponse<GiftCardItem>, string>({
      query: (id) => `/gift-cards/${id}`,
      providesTags: (_res, _err, id) => [{ type: "GiftCard", id }],
    }),

    issueGiftCard: builder.mutation<ApiResponse<GiftCardItem>, CreateGiftCardInput>({
      query: (body) => ({
        url: "/gift-cards",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GiftCard"],
    }),

    updateGiftCard: builder.mutation<
      ApiResponse<GiftCardItem>,
      { id: string; data: UpdateGiftCardInput }
    >({
      query: ({ id, data }) => ({
        url: `/gift-cards/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["GiftCard"],
    }),

    toggleGiftCardStatus: builder.mutation<ApiResponse<GiftCardItem>, string>({
      query: (id) => ({
        url: `/gift-cards/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["GiftCard"],
    }),

    deleteGiftCard: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/gift-cards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GiftCard"],
    }),
  }),
});

export const {
  useGetGiftCardsQuery,
  useGetGiftCardByIdQuery,
  useIssueGiftCardMutation,
  useUpdateGiftCardMutation,
  useToggleGiftCardStatusMutation,
  useDeleteGiftCardMutation,
} = giftCardsApi;
