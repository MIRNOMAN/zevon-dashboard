/**
 * Product domain types.
 *
 * These are the canonical TypeScript interfaces for the Products feature.
 * For runtime validation, see the corresponding Zod schemas in
 * `../schemas/product.schema.ts`.
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
