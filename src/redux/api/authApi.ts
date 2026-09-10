import { baseApi, type ApiResponse } from "./baseApi";
import {
  setCredentials,
  setUser,
  logout as logoutAction,
  type User,
  type UserRole,
} from "../features/authSlice";

// ---------------------------------------------------------------------------
// Request DTOs matching zevon-server
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterAdminRequest {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER";
  adminSecretKey: string;
  phone?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponseData {
  success: boolean;
  message: string;
  email?: string;
}

export interface VerifyRegisterResponseData {
  user: User;
  message: string;
}

// ---------------------------------------------------------------------------
// Auth API Slice
// ---------------------------------------------------------------------------

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. Login
    login: builder.mutation<ApiResponse<AuthData>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data) {
            dispatch(
              setCredentials({
                user: data.data.user,
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              }),
            );
          }
        } catch {
          // Error handled in UI
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    // 2. Forgot Password (Dispatches OTP to email)
    forgotPassword: builder.mutation<ApiResponse<MessageResponseData>, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // 3. Verify Reset Password OTP
    verifyResetOtp: builder.mutation<ApiResponse<MessageResponseData>, VerifyOtpRequest>({
      query: (body) => ({
        url: "/auth/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),

    // 4. Complete Password Reset
    resetPassword: builder.mutation<ApiResponse<MessageResponseData>, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    // 5. Resend Reset Password OTP
    resendResetOtp: builder.mutation<ApiResponse<MessageResponseData>, ResendOtpRequest>({
      query: (body) => ({
        url: "/auth/resend-reset-otp",
        method: "POST",
        body,
      }),
    }),

    // 6. Initiate Register (Sends OTP)
    register: builder.mutation<ApiResponse<MessageResponseData>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    // 7. Verify Registration OTP
    verifyRegisterOtp: builder.mutation<ApiResponse<VerifyRegisterResponseData>, VerifyOtpRequest>({
      query: (body) => ({
        url: "/auth/verify-register-otp",
        method: "POST",
        body,
      }),
    }),

    // 8. Resend Registration OTP
    resendRegisterOtp: builder.mutation<ApiResponse<MessageResponseData>, ResendOtpRequest>({
      query: (body) => ({
        url: "/auth/resend-register-otp",
        method: "POST",
        body,
      }),
    }),

    // 9. Register Admin / Manager
    registerAdmin: builder.mutation<ApiResponse<AuthData>, RegisterAdminRequest>({
      query: (body) => ({
        url: "/auth/register-admin",
        method: "POST",
        body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data) {
            dispatch(
              setCredentials({
                user: data.data.user,
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              }),
            );
          }
        } catch {
          // Error handled in UI
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    // 10. Logout
    logout: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logoutAction());
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    // 11. Refresh Token
    refreshToken: builder.mutation<ApiResponse<{ accessToken: string; refreshToken: string }>, RefreshTokenRequest>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),

    // 12. Get Current User Profile
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data) {
            dispatch(setUser(data.data));
          }
        } catch {
          // Token might be invalid or network error
        }
      },
    }),
  }),
});

// ---------------------------------------------------------------------------
// Auto-generated hooks
// ---------------------------------------------------------------------------

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useResendResetOtpMutation,
  useRegisterMutation,
  useVerifyRegisterOtpMutation,
  useResendRegisterOtpMutation,
  useRegisterAdminMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;
