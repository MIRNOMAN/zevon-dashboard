// ---------------------------------------------------------------------------
// Shoppable Lookbook Types matching zevon-server
// ---------------------------------------------------------------------------

export interface LookbookHotspot {
  id?: string;
  xPercent: number;
  yPercent: number;
  productId: string;
  product?: {
    id: string;
    title: string;
    slug: string;
    basePrice: number | string;
    discountPrice?: number | string | null;
    images?: Array<{ url: string; altText?: string | null; isPrimary: boolean }>;
    category?: { id: string; name: string; slug: string };
  };
}

export interface LookbookItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl: string;
  imageUrl?: string | null; // Compatibility fallback
  tags?: string[];
  season?: string | null;
  isActive: boolean;
  sortOrder: number;
  hotspots?: LookbookHotspot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LookbookAdminResponse {
  lookbooks: LookbookItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateLookbookInput {
  title: string;
  slug?: string;
  description?: string;
  coverImageUrl: string;
  tags?: string[];
  isActive?: boolean;
  sortOrder?: number;
  hotspots?: Array<{
    xPercent: number;
    yPercent: number;
    productId: string;
  }>;
}

export interface LookbookQueryParams {
  page?: number;
  limit?: number;
  tag?: string;
  isActive?: boolean;
  search?: string;
}
