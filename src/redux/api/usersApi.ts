import { baseApi, type ApiResponse } from "./baseApi";
import type { UserDirectoryItem, UserRole } from "@/types/users";

export interface UsersResponseData {
  users: UserDirectoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export const usersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsers: builder.query<
      ApiResponse<UsersResponseData | UserDirectoryItem[]>,
      UserQueryParams | void
    >({
      query: (params) => ({
        url: "/users",
        params: params ? { ...params } : undefined,
      }),
      providesTags: ["User"],
    }),

    getUserById: builder.query<ApiResponse<UserDirectoryItem>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: "User", id }],
    }),

    updateUserRole: builder.mutation<
      ApiResponse<{ id: string; email: string; name: string; role: UserRole }>,
      { id: string; role: UserRole }
    >({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["User"],
    }),

    updateUserStatus: builder.mutation<
      ApiResponse<{ id: string; email: string; name: string; isActive: boolean }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation<ApiResponse<{ id: string; email: string }>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;
