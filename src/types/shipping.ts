// ---------------------------------------------------------------------------
// Shipping Zone Types
// ---------------------------------------------------------------------------

export interface ShippingZoneItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  cost: number | string;
  expressCost?: number | string | null;
  estimatedDeliveryDays?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShippingZoneInput {
  code: string;
  name: string;
  description?: string;
  cost: number;
  expressCost?: number;
  estimatedDeliveryDays?: string;
  isActive?: boolean;
}
