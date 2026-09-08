import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./features/authSlice";
import productReducer from "./features/productSlice";

// ---------------------------------------------------------------------------
// Store factory (one store per client mount in App Router)
// ---------------------------------------------------------------------------

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      products: productReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });
}

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
