// ---------------------------------------------------------------------------
// Order & Return Types
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  total: number | string;
  subtotal: number | string;
  shippingCost: number | string;
  discount: number | string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  items?: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    variant?: {
      sku: string;
      size: string;
      color: string;
      product?: { title: string };
    };
  }>;
}

export interface ReturnItem {
  id: string;
  orderId?: string;
  orderNumber?: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  createdAt: string;
  user?: { name: string; email: string };
}
