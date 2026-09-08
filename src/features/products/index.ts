/**
 * Products feature — public API (barrel export).
 *
 * ```ts
 * import { Product, getProducts, ProductCard } from "@/features/products";
 * ```
 */

// Types
export type {
  Product,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
} from "./types/product.types";

// Schemas
export {
  productSchema,
  createProductSchema,
  productListResponseSchema,
} from "./schemas/product.schema";
export type {
  ProductSchema,
  CreateProductSchema,
  ProductListResponseSchema,
} from "./schemas/product.schema";

// Services (server-side data fetching)
export {
  getProducts,
  getProductBySlug,
  createProduct,
} from "./services/product.service";

// Components
export { ProductCard } from "./components/product-card";
export { ProductList } from "./components/product-list";

// Hooks (client-only — uses RTK Query + Redux)
export { useProducts, useProduct, useSelectedProduct } from "./hooks/use-products";
