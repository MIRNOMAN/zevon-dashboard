// ---------------------------------------------------------------------------
// Flash Sales Types
// ---------------------------------------------------------------------------

export interface FlashSaleItem {
  id: string;
  title: string;
  description?: string | null;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlashSaleInput {
  title: string;
  description?: string;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}
