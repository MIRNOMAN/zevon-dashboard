import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { logout, updateAccessToken } from "../features/authSlice";
import { RootState } from "../store";

// ---------------------------------------------------------------------------
// Standard API Envelope from zevon-server
// ---------------------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Base query — auto-injects Authorization header from Redux state / localStorage
// ---------------------------------------------------------------------------

const rawBaseQuery = fetchBaseQuery({
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000/api/v1",
  prepareHeaders: (headers, { getState }) => {
    let token = (getState() as RootState).auth.accessToken;

    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("zevon_access_token");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    return headers;
  },
});

// ---------------------------------------------------------------------------
// Base query with automatic token refresh (re-auth on 401)
// ---------------------------------------------------------------------------

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    let refreshToken = state.auth.refreshToken;

    if (!refreshToken && typeof window !== "undefined") {
      refreshToken = localStorage.getItem("zevon_refresh_token");
    }

    if (refreshToken) {
      // Attempt to rotate access & refresh token
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const payload = refreshResult.data as
          | ApiResponse<{ accessToken: string; refreshToken: string }>
          | { accessToken: string; refreshToken: string };

        const tokens = "data" in payload && payload.data ? payload.data : (payload as { accessToken: string; refreshToken: string });

        api.dispatch(
          updateAccessToken({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }),
        );

        // Retry the original request with the new access token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed — clear auth state
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Base API — all feature APIs inject endpoints into this
// ---------------------------------------------------------------------------

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Product",
    "User",
    "Order",
    "Category",
    "Analytics",
    "Coupon",
    "Review",
    "Banner",
    "Shipping",
  ],
  endpoints: () => ({}),
});

