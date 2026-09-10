// ---------------------------------------------------------------------------
// Abandoned Cart Types matching zevon-server
// ---------------------------------------------------------------------------

export interface AbandonedCartUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface AbandonedCartItem {
  id: string;
  user: AbandonedCartUser | null;
  itemsCount: number;
  abandonedEmailSentAt: string | null;
  abandonedEmailCount: number;
  lastActiveAt: string;
}

export interface AbandonedCartsResponse {
  totalAbandoned: number;
  carts: AbandonedCartItem[];
}

export interface TriggerRecoveryResponse {
  scannedCartsCount: number;
  dispatchedRecoveryEmails: number;
  timestamp: string;
}
