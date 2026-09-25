import { baseApi, type ApiResponse } from "./baseApi";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "STOCK" | "RETURN" | "REVIEW" | "SYSTEM";
  link: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<NotificationItem[]>, void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),

    getUnreadNotificationsCount: builder.query<ApiResponse<{ unreadCount: number }>, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),

    markNotificationsAsRead: builder.mutation<
      ApiResponse<{ success: boolean; message: string }>,
      { id?: string; all?: boolean }
    >({
      query: (body) => ({
        url: "/notifications/mark-read",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationsAsReadMutation,
} = notificationsApi;
