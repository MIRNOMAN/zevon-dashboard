"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectProduct,
  selectCurrentProduct,
  clearSelectedProduct,
} from "@/redux/features/productSlice";
import {
  useGetProductsQuery,
  useGetProductBySlugQuery,
} from "@/redux/api/productApi";
import type { Product } from "../types/product.types";

// ---------------------------------------------------------------------------
// useProducts — list hook (RTK Query)
// ---------------------------------------------------------------------------

/**
 * Fetch and manage the product list using RTK Query.
 *
 * For Server Components, use the service layer directly:
 * ```tsx
 * import { getProducts } from "@/features/products";
 * const { data } = await getProducts();
 * ```
 */
export function useProducts() {
  const { data, isLoading, error, refetch } = useGetProductsQuery();

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? "Failed to fetch products" : null,
    refresh: refetch,
  };
}

// ---------------------------------------------------------------------------
// useProduct — single product hook (RTK Query)
// ---------------------------------------------------------------------------

export function useProduct(slug: string) {
  const { data, isLoading, error } = useGetProductBySlugQuery(slug);

  return {
    product: data ?? null,
    isLoading,
    error: error ? "Product not found" : null,
  };
}

// ---------------------------------------------------------------------------
// useSelectedProduct — local selection state (Redux slice)
// ---------------------------------------------------------------------------

export function useSelectedProduct() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectCurrentProduct);

  const select = useCallback(
    (product: Product) => dispatch(selectProduct(product)),
    [dispatch],
  );

  const clear = useCallback(
    () => dispatch(clearSelectedProduct()),
    [dispatch],
  );

  return { selected, select, clear };
}
