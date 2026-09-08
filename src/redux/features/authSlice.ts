import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set user + tokens after login/register.
     * Call this from your login mutation's `onQueryStarted` or in a component.
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
    },

    /**
     * Update only the user profile (e.g. after editing profile).
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    /**
     * Update access token only (e.g. after silent refresh).
     */
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    /**
     * Clear all auth state — full logout.
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const { setCredentials, setUser, updateAccessToken, logout } =
  authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUserRole = (state: RootState) => state.auth.user?.role ?? null;

/**
 * Check if the current user has one of the required roles.
 *
 * Usage:
 * ```ts
 * const canAccess = useAppSelector((state) =>
 *   selectHasRole(state, ["admin", "moderator"])
 * );
 * ```
 */
export const selectHasRole = (
  state: RootState,
  roles: Array<User["role"]>,
): boolean => {
  const userRole = state.auth.user?.role;
  return userRole ? roles.includes(userRole) : false;
};

// ---------------------------------------------------------------------------
// Reducer export
// ---------------------------------------------------------------------------

export default authSlice.reducer;
