export type GiftCardStatus = "ACTIVE" | "REDEEMED" | "EXPIRED" | "DISABLED";

export interface GiftCardRedemption {
  id: string;
  giftCardId: string;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  };
  orderId?: string | null;
  amountDeducted: number;
  balanceAfter: number;
  createdAt: string;
}

export interface GiftCardItem {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  senderId?: string | null;
  sender?: {
    id?: string;
    name?: string | null;
    email?: string;
  } | null;
  recipientEmail: string;
  recipientName?: string | null;
  customMessage?: string | null;
  status: GiftCardStatus;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  redemptions?: GiftCardRedemption[];
  _count?: {
    redemptions: number;
  };
}

export interface CreateGiftCardInput {
  amount: number;
  recipientEmail: string;
  recipientName?: string;
  code?: string;
  customMessage?: string;
  status?: GiftCardStatus;
  expiresAt?: string;
  sendEmail?: boolean;
}

export interface UpdateGiftCardInput {
  code?: string;
  initialBalance?: number;
  currentBalance?: number;
  recipientEmail?: string;
  recipientName?: string;
  customMessage?: string;
  status?: GiftCardStatus;
  expiresAt?: string;
}

export interface GiftCardQueryParams {
  page?: number;
  limit?: number;
  status?: GiftCardStatus;
  search?: string;
}
