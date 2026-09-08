import { cache } from "react";
import type {
  Product,
  ProductListResponse,
  CreateProductInput,
} from "../types/product.types";

// ---------------------------------------------------------------------------
// Mock data (replace with real fetcher calls in production)
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_01",
    name: "Enterprise Platform",
    slug: "sample-product",
    description:
      "A comprehensive enterprise platform that streamlines your team's workflow with intelligent automation, real-time collaboration, and advanced analytics. Built for scale with multi-tenant architecture and SOC 2 compliance.",
    price: 9999,
    category: "Platform",
    image: "https://acme.example.com/og-default.png",
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2024-06-20T12:30:00.000Z",
  },
  {
    id: "prod_02",
    name: "Analytics Suite",
    slug: "analytics-suite",
    description:
      "Real-time analytics and reporting tools for data-driven decisions. Features customizable dashboards, predictive modeling, and automated insights delivery.",
    price: 4999,
    category: "Analytics",
    image: "https://acme.example.com/og-default.png",
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2024-07-15T09:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Fetch all products.
 *
 * In production, replace the mock with:
 * ```ts
 * const response = await fetcher.get<ProductListResponse>("/products");
 * return productListResponseSchema.parse(response);
 * ```
 */
export async function getProducts(): Promise<ProductListResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    data: MOCK_PRODUCTS,
    total: MOCK_PRODUCTS.length,
    page: 1,
    pageSize: 10,
  };
}

/**
 * Fetch a single product by slug.
 *
 * Wrapped with React `cache()` so duplicate calls within the same
 * server request (e.g. `generateMetadata` + page component) only
 * execute once.
 */
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | undefined> => {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 50));

    return MOCK_PRODUCTS.find((p) => p.slug === slug);
  },
);

/**
 * Create a new product.
 *
 * In production, replace with:
 * ```ts
 * const validated = createProductSchema.parse(input);
 * return fetcher.post<Product>("/products", validated, { token });
 * ```
 */
export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const now = new Date().toISOString();
  return {
    id: `prod_${Date.now()}`,
    image: "https://acme.example.com/og-default.png",
    ...input,
    createdAt: now,
    updatedAt: now,
  };
}
