// ---------------------------------------------------------------------------
// Review & Moderation Types
// ---------------------------------------------------------------------------

export interface ReviewAdminItem {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  product?: {
    id: string;
    title: string;
    slug: string;
    basePrice: number | string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}
