// ---------------------------------------------------------------------------
// Product Types & Interfaces matching zevon-server
// ---------------------------------------------------------------------------

export interface ProductVariantInput {
  sku: string;
  color: string;
  colorCode: string;
  size: string;
  stock: number;
  extraPrice?: number;
  imageUrl?: string;
}

export interface ProductImageInput {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  title: string;
  slug?: string;
  description: string;
  details?: string;
  fabricSpecs?: string;
  washCare?: string;
  tags?: string[];
  basePrice: number;
  discountPrice?: number;
  categoryId: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  gender?: string;
  season?: string;
  variants: ProductVariantInput[];
  images?: ProductImageInput[];
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  details?: string | null;
  fabricSpecs?: string | null;
  washCare?: string | null;
  tags?: string[];
  basePrice: number | string;
  discountPrice?: number | string | null;
  gender: string;
  season: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
  images?: Array<{ id?: string; url: string; isPrimary: boolean; altText?: string | null }>;
  variants?: Array<{ id: string; sku: string; stock: number; size: string; color: string; colorCode?: string; extraPrice?: number | string; imageUrl?: string | null }>;
  _count?: { variants: number; reviews: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  gender?: string;
  season?: string;
}
