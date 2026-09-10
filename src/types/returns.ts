// ---------------------------------------------------------------------------
// Returns & Refunds Domain Types matching zevon-server
// ---------------------------------------------------------------------------

export type ReturnStatus =
  | "REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "REFUNDED";

export type ReturnResolution = "REFUND" | "EXCHANGE";

export interface ReturnOrderItem {
  id?: string;
  productTitle: string;
  sku: string;
  size: string;
  color: string;
  unitPrice?: number;
  quantity?: number;
  totalPrice: number;
  product?: {
    id: string;
    title: string;
    slug: string;
    images?: Array<{ url: string; isPrimary: boolean; altText?: string | null }>;
  };
  variant?: {
    id: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
  };
}

export interface ReturnRequestItem {
  id: string;
  returnReference: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  reason: string;
  status: ReturnStatus;
  resolution: ReturnResolution;
  exchangeVariantId?: string | null;
  proofImages: string[];
  pickupAddress?: {
    fullName?: string;
    phone?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    email?: string;
  } | Record<string, unknown> | null;
  trackingNumber?: string | null;
  adminNotes?: string | null;
  refundAmount?: number | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
  };
  order?: {
    id?: string;
    orderNumber: string;
    status?: string;
    createdAt?: string;
  };
  orderItem?: ReturnOrderItem;
}

export interface ReturnsResponse {
  returns: ReturnRequestItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReturnQueryParams {
  page?: number;
  limit?: number;
  status?: ReturnStatus | string;
  resolution?: ReturnResolution | string;
  search?: string;
}

export interface ApproveReturnInput {
  adminNotes?: string;
  trackingNumber?: string;
}

export interface RejectReturnInput {
  reason: string;
}

export interface ReceiveReturnInput {
  adminNotes?: string;
}

export interface RefundReturnInput {
  refundAmount?: number;
  adminNotes?: string;
}

export interface UpdateReturnStatusInput {
  status: ReturnStatus;
  adminNotes?: string;
  refundAmount?: number;
  trackingNumber?: string;
}
