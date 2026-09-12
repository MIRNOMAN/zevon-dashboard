// ---------------------------------------------------------------------------
// Coupon & Promotion Types
// ---------------------------------------------------------------------------

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number | string;
  minOrderAmount?: number | string | null;
  maxDiscountAmount?: number | string | null;
  maxDiscount?: number | null; // legacy alias
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount: number;
  usageCount?: number; // legacy alias
  perUserLimit?: number;
  isActive: boolean;
  status?: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SCHEDULED" | string;
  redeemedOrdersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {}

