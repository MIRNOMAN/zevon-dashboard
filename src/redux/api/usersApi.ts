import { baseApi, type ApiResponse } from "./baseApi";
import type { UserDirectoryItem } from "@/types/users";

export const usersApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getUsers: builder.query<
      ApiResponse<{ users: UserDirectoryItem[]; total: number } | UserDirectoryItem[]>,
      void
    >({
      query: () => "/users",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
} = usersApi;
