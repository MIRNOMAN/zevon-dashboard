import { baseApi, type ApiResponse } from "./baseApi";
import type {
  ChatRoomsResponse,
  ChatHistoryResponse,
  UploadChatResponse,
  ChatHistoryQuery,
} from "@/types/chat";

export const chatApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getChatRooms: builder.query<
      ApiResponse<ChatRoomsResponse>,
      ChatHistoryQuery | void
    >({
      query: (params) => ({
        url: "/chat/rooms",
        params: params ? { ...params } : undefined,
      }),
      providesTags: ["Chat"],
    }),

    getChatHistory: builder.query<
      ApiResponse<ChatHistoryResponse>,
      { customerId: string; page?: number; limit?: number }
    >({
      query: ({ customerId, page = 1, limit = 50 }) => ({
        url: `/chat/history/${customerId}`,
        params: { page, limit },
      }),
      providesTags: (_res, _err, { customerId }) => [
        { type: "Chat", id: customerId },
      ],
    }),

    markChatAsRead: builder.mutation<
      ApiResponse<{ count: number }>,
      string
    >({
      query: (customerId) => ({
        url: `/chat/read/${customerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Chat"],
    }),

    uploadChatAttachment: builder.mutation<
      ApiResponse<UploadChatResponse>,
      FormData
    >({
      query: (formData) => ({
        url: "/chat/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetChatHistoryQuery,
  useLazyGetChatHistoryQuery,
  useMarkChatAsReadMutation,
  useUploadChatAttachmentMutation,
} = chatApi;
