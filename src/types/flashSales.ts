// ---------------------------------------------------------------------------
// Flash Sales Types
// ---------------------------------------------------------------------------

export interface FlashSaleProductItem {
  id?: string;
  productId: string;
  discountPrice: number;
  discountPercent?: number;
  quantityLimit: number;
  soldCount?: number;
  product?: {
    id: string;
    title: string;
    slug: string;
    basePrice: number | string;
    discountPrice?: number | string | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
    images?: {
      url: string;
      altText?: string;
      isPrimary: boolean;
    }[];
  };
}

export interface CountdownTimer {
  serverTime: string;
  startTime: string;
  endTime: string;
  status: "LIVE" | "UPCOMING" | "ENDED";
  timeRemainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface FlashSaleItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  bannerUrl?: string | null;
  discountPercent?: number | null;
  discountPercentage?: number; // legacy alias
  startTime: string;
  endTime: string;
  isActive: boolean;
  status?: "LIVE" | "UPCOMING" | "ENDED" | "INACTIVE" | string;
  productCount?: number;
  totalAllocatedStock?: number;
  totalClaimedStock?: number;
  overallClaimProgressPercentage?: number;
  items?: FlashSaleProductItem[];
  countdown?: CountdownTimer;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashSaleItemInput {
  productId: string;
  discountPrice: number;
  discountPercent?: number;
  quantityLimit: number;
  soldCount?: number;
}

export interface CreateFlashSaleInput {
  title: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  discountPercent?: number;
  discountPercentage?: number; // alias
  startTime: string;
  endTime: string;
  isActive?: boolean;
  items: CreateFlashSaleItemInput[];
}

export interface UpdateFlashSaleInput extends Partial<CreateFlashSaleInput> {}

export interface FlashSaleQueryParams {
  page?: number;
  limit?: number;
  status?: "LIVE" | "UPCOMING" | "ENDED" | "INACTIVE";
  search?: string;
}

