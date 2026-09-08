import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Pre-typed `useDispatch` — use this everywhere instead of plain `useDispatch`.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;

/**
 * Pre-typed `useSelector` — use this everywhere instead of plain `useSelector`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
