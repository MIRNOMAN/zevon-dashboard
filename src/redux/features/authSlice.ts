import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ---------------------------------------------------------------------------
// Types matching zevon-server
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// ---------------------------------------------------------------------------
// Initial state (Deterministic across SSR and Client Initial Render)
// ---------------------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Rehydrate auth on client mount
     */
    initializeAuth: (
      state,
      action: PayloadAction<{
        user: User | null;
        accessToken: string | null;
        refreshToken: string | null;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = Boolean(
        action.payload.accessToken && action.payload.user,
      );
      state.isInitialized = true;
    },

    /**
     * Set user + tokens after login/register.
     */
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload;

      if (user) {
        state.user = user;
      }
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isInitialized = true;

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zevon_access_token", accessToken);
          localStorage.setItem("zevon_refresh_token", refreshToken);
          if (user) {
            localStorage.setItem("zevon_user", JSON.stringify(user));
          }
        } catch {
          // Ignore local storage error
        }
      }
    },

    /**
     * Update only the user profile (e.g. after editing profile or getMe).
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zevon_user", JSON.stringify(action.payload));
        } catch {
          // Ignore
        }
      }
    },

    /**
     * Update access token only (e.g. after silent refresh).
     */
    updateAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("zevon_access_token", action.payload.accessToken);
          if (action.payload.refreshToken) {
            localStorage.setItem(
              "zevon_refresh_token",
              action.payload.refreshToken,
            );
          }
        } catch {
          // Ignore
        }
      }
    },

    /**
     * Clear all auth state — full logout.
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("zevon_access_token");
          localStorage.removeItem("zevon_refresh_token");
          localStorage.removeItem("zevon_user");
        } catch {
          // Ignore
        }
      }
    },
  },
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const { initializeAuth, setCredentials, setUser, updateAccessToken, logout } =
  authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;
export const selectIsAuthInitialized = (state: RootState) =>
  state.auth.isInitialized;

export const selectHasRole = (
  state: RootState,
  roles: Array<UserRole>,
): boolean => {
  const userRole = state.auth.user?.role;
  return userRole ? roles.includes(userRole) : false;
};

// ---------------------------------------------------------------------------
// Reducer export
// ---------------------------------------------------------------------------

export default authSlice.reducer;
