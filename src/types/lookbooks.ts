// ---------------------------------------------------------------------------
// Shoppable Lookbook Types
// ---------------------------------------------------------------------------

export interface LookbookItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  season?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLookbookInput {
  title: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  season?: string;
  isActive?: boolean;
}
