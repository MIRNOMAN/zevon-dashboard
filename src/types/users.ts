// ---------------------------------------------------------------------------
// User & Customer Directory Types
// ---------------------------------------------------------------------------

export type UserRole = "ADMIN" | "MANAGER" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
}
