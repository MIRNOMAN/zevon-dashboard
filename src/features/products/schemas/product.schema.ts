import { z } from "zod";

// ---------------------------------------------------------------------------
// Product schema (runtime validation)
// ---------------------------------------------------------------------------

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a valid URL slug"),
  description: z.string().min(1).max(2000),
  price: z.number().int().nonnegative(), // cents
  category: z.string().min(1),
  image: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProductSchema = z.infer<typeof productSchema>;

// ---------------------------------------------------------------------------
// Create Product schema (input validation)
// ---------------------------------------------------------------------------

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a valid URL slug"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  price: z
    .number()
    .int("Price must be in whole cents")
    .nonnegative("Price cannot be negative"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Must be a valid image URL").optional(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

// ---------------------------------------------------------------------------
// Product list response schema
// ---------------------------------------------------------------------------

export const productListResponseSchema = z.object({
  data: z.array(productSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

export type ProductListResponseSchema = z.infer<
  typeof productListResponseSchema
>;
