// ---------------------------------------------------------------------------
// Physical Store Types
// ---------------------------------------------------------------------------

export interface StoreItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStoreInput {
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isActive?: boolean;
}

export interface UpdateStoreInput {
  id: string;
  data: Partial<CreateStoreInput>;
}
