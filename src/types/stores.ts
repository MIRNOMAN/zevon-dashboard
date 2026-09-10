// ---------------------------------------------------------------------------
// Physical Store Types
// ---------------------------------------------------------------------------

export interface StoreItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  openingHours?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreInput {
  name: string;
  address: string;
  city: string;
  phone?: string;
  openingHours?: string;
  isActive?: boolean;
}
