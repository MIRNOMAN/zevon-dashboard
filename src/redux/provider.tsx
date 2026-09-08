"use client";

import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";
import { initializeAuth, type User } from "./features/authSlice";

/**
 * Client-side Redux provider.
 * Uses lazy `useState` initializer — creates the store exactly once per mount
 * and synchronizes stored auth credentials from localStorage on client mount.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("zevon_access_token");
      const refreshToken = localStorage.getItem("zevon_refresh_token");
      const userJson = localStorage.getItem("zevon_user");
      const user = userJson ? (JSON.parse(userJson) as User) : null;

      store.dispatch(
        initializeAuth({
          user,
          accessToken,
          refreshToken,
        }),
      );
    } catch {
      store.dispatch(
        initializeAuth({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),
      );
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
