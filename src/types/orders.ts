// ---------------------------------------------------------------------------
// Order & Return Types matching zevon-server
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface AddressSnapshot {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface OrderLineItem {
  id: string;
  orderId?: string;
  productId: string;
  variantId?: string | null;
  productTitle: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number | string;
  quantity: number;
  totalPrice: number | string;
  product?: {
    id: string;
    title: string;
    slug: string;
    images?: Array<{ url: string; isPrimary: boolean; altText?: string | null }>;
  };
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentReference?: string | null;
  subtotal: number | string;
  discountAmount?: number | string;
  discount?: number | string;
  shippingCost: number | string;
  totalAmount: number | string;
  total?: number | string;
  currency?: string;
  shippingAddress?: AddressSnapshot | Record<string, unknown> | null;
  billingAddress?: AddressSnapshot | Record<string, unknown> | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  estimatedDeliveryDate?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  shippingZone?: {
    id?: string;
    name: string;
    estimatedDeliveryDays?: string | null;
  };
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  items?: OrderLineItem[];
  _count?: {
    items: number;
  };
}

export interface OrdersResponse {
  orders: OrderItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  adminNotes?: string;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
  paymentReference?: string;
}

export interface AssignCourierInput {
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
}

import type { ReturnRequestItem } from "./returns";
export type ReturnItem = ReturnRequestItem;

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}
