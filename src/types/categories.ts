// ---------------------------------------------------------------------------
// Category Types & Interfaces matching zevon-server
// ---------------------------------------------------------------------------

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: CategoryItem[];
  _count?: { products: number; children: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryAdminResponse {
  categories: CategoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
}
