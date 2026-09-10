// ---------------------------------------------------------------------------
// Analytics & Inventory Alert Types
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  kpis?: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    currency?: string;
  };
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  averageOrderValue?: number;
  conversionRate?: number;
  revenueGrowthPercentage?: number;
  orderGrowthPercentage?: number;
  dailySalesChart?: Array<{
    date: string;
    revenue: number;
    orderCount: number;
    paidOrdersCount: number;
  }>;
  dailySales?: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus?: Record<string, number>;
  returnsSummary?: {
    totalReturns: number;
    byStatus: Record<string, number>;
  };
  inventoryAlertsCount?: number;
  topSellingProducts?: Array<{
    productId?: string;
    productTitle: string;
    category?: string;
    totalUnitsSold: number;
    totalRevenue: number;
    inStock?: number;
    imageUrl?: string | null;
  }>;
}

export interface InventoryAlertSummary {
  totalAlerts: number;
  outOfStockCount: number;
  criticalCount: number;
  lowStockCount: number;
  threshold: number;
}

export interface InventoryAlertItem {
  variantId?: string;
  id?: string;
  sku: string;
  stock: number;
  color: string;
  colorCode?: string;
  size: string;
  severity: "OUT_OF_STOCK" | "CRITICAL" | "LOW_STOCK" | "LOW" | "HEALTHY";
  unitPrice?: number;
  imageUrl?: string | null;
  product: {
    id: string;
    title: string;
    slug: string;
    basePrice?: number | string;
    discountPrice?: number | string | null;
    isPublished?: boolean;
    category?: { name: string };
    categoryName?: string;
  };
}

export interface InventoryAlertsResponse {
  summary: InventoryAlertSummary;
  alerts: InventoryAlertItem[];
}
