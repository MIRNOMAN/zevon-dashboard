import { baseApi, type ApiResponse } from "./baseApi";

// ---------------------------------------------------------------------------
// Dashboard Types matching zevon-server
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowthPercentage: number;
  orderGrowthPercentage: number;
  dailySales?: Array<{ date: string; revenue: number; orders: number }>;
}

export interface InventoryAlertItem {
  id: string;
  sku: string;
  stock: number;
  color: string;
  size: string;
  severity: "CRITICAL" | "LOW" | "HEALTHY";
  product: {
    id: string;
    title: string;
    slug: string;
    basePrice: number | string;
    category?: { name: string };
  };
}

export interface ProductVariantInput {
  sku: string;
  color: string;
  colorCode: string;
  size: string;
  stock: number;
  extraPrice?: number;
  imageUrl?: string;
}

export interface ProductImageInput {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  title: string;
  slug?: string;
  description: string;
  details?: string;
  fabricSpecs?: string;
  washCare?: string;
  tags?: string[];
  basePrice: number;
  discountPrice?: number;
  categoryId: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  gender?: string;
  season?: string;
  variants: ProductVariantInput[];
  images?: ProductImageInput[];
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number | string;
  discountPrice?: number | string | null;
  gender: string;
  season: string;
  isActive: boolean;
  isFeatured: boolean;
  category?: { id: string; name: string; slug: string };
  images?: Array<{ url: string; isPrimary: boolean }>;
  variants?: Array<{ id: string; sku: string; stock: number; size: string; color: string }>;
  _count?: { variants: number; reviews: number };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId?: string | null;
  children?: CategoryItem[];
  _count?: { products: number; children: number };
}

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
  items?: Array<{ id: string; quantity: number; unitPrice: number; variant?: { sku: string; size: string; color: string; product?: { title: string } } }>;
}

export interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  usageCount: number;
  usageLimit?: number | null;
  isActive: boolean;
  expiresAt?: string | null;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  ctaText?: string | null;
  linkUrl?: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "CUSTOMER";
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
}

export interface FlashSaleItem {
  id: string;
  title: string;
  description?: string | null;
  discountPercentage: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
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

export interface ShippingZoneItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  cost: number | string;
  expressCost?: number | string | null;
  estimatedDeliveryDays?: string | null;
  isActive: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  openingHours?: string | null;
  isActive: boolean;
}

export interface CurrencyMetadata {
  code: string;
  symbol: string;
  name: string;
  rateFromBDT: number;
  rateToBDT: number;
  decimalPlaces: number;
}

export interface CurrencyRatesResponse {
  baseCurrency: string;
  baseSymbol: string;
  supportedCurrencies: CurrencyMetadata[];
  lastUpdated: string;
}

export interface CurrencyConvertResponse {
  originalAmount: number;
  fromCurrency: string;
  fromSymbol: string;
  convertedAmount: number;
  toCurrency: string;
  toSymbol: string;
  formatted: string;
  exchangeRate: number;
}

export interface CurrencyDetectResponse {
  detectedCountry: string;
  countryName: string;
  recommendedCurrency: string;
  symbol: string;
  currencyName: string;
  exchangeRateFromBDT: number;
}

export interface UpdateRatesInput {
  USD?: number;
  EUR?: number;
  GBP?: number;
}

export interface LookbookItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  season?: string | null;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// RTK Query Dashboard API Endpoints
// ---------------------------------------------------------------------------

export const dashboardApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // 1. Dashboard KPIs & Aggregations
    getDashboardMetrics: builder.query<ApiResponse<DashboardMetrics>, void>({
      query: () => "/analytics/dashboard",
      providesTags: ["Analytics"],
    }),

    // 2. Inventory Low-Stock Alerts
    getInventoryAlerts: builder.query<ApiResponse<InventoryAlertItem[]>, { threshold?: number } | void>({
      query: (params) => ({
        url: "/analytics/inventory-alerts",
        params: params ? { threshold: params.threshold } : undefined,
      }),
      providesTags: ["Product"],
    }),

    // 3. Products
    getAdminProducts: builder.query<ApiResponse<{ products: ProductItem[]; total: number } | ProductItem[]>, { page?: number; limit?: number; search?: string; categoryId?: string } | void>({
      query: (params) => ({
        url: "/products/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Product"],
    }),

    getPublicProducts: builder.query<ApiResponse<{ products: ProductItem[]; total: number } | ProductItem[]>, void>({
      query: () => "/products",
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<ApiResponse<ProductItem>, CreateProductInput>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    deleteProduct: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    // 4. Categories
    getCategories: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),

    getCategoryTree: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => "/categories/tree",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<ApiResponse<CategoryItem>, Partial<CategoryItem>>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    // 5. Orders
    getAdminOrders: builder.query<ApiResponse<{ orders: OrderItem[]; total: number } | OrderItem[]>, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: "/orders",
        params: params ?? undefined,
      }),
      providesTags: ["Order"],
    }),

    getOrderMetrics: builder.query<ApiResponse<Record<string, unknown>>, void>({
      query: () => "/orders/metrics/summary",
      providesTags: ["Order"],
    }),

    // 6. Coupons
    getCoupons: builder.query<ApiResponse<{ coupons: CouponItem[]; total: number } | CouponItem[]>, void>({
      query: () => "/coupons",
      providesTags: ["Coupon"],
    }),

    createCoupon: builder.mutation<ApiResponse<CouponItem>, Partial<CouponItem>>({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    // 7. Banners
    getBanners: builder.query<ApiResponse<BannerItem[]>, void>({
      query: () => "/banners",
      providesTags: ["Product"],
    }),

    // 8. Users
    getUsers: builder.query<ApiResponse<{ users: UserDirectoryItem[]; total: number } | UserDirectoryItem[]>, void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // 9. Flash Sales
    getFlashSales: builder.query<ApiResponse<{ flashSales: FlashSaleItem[]; total: number } | FlashSaleItem[]>, void>({
      query: () => "/flash-sales/admin/all",
      providesTags: ["Product"],
    }),

    createFlashSale: builder.mutation<ApiResponse<FlashSaleItem>, Record<string, unknown>>({
      query: (body) => ({
        url: "/flash-sales",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // 10. Returns
    getReturns: builder.query<ApiResponse<{ returns: ReturnItem[]; total: number } | ReturnItem[]>, void>({
      query: () => "/returns",
      providesTags: ["Order"],
    }),

    updateReturnStatus: builder.mutation<ApiResponse<ReturnItem>, { id: string; status: string; adminNotes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/returns/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // 11. Shipping Zones
    getShippingZones: builder.query<ApiResponse<{ zones: ShippingZoneItem[]; total: number } | ShippingZoneItem[]>, void>({
      query: () => "/shipping",
    }),

    createShippingZone: builder.mutation<ApiResponse<ShippingZoneItem>, Record<string, unknown>>({
      query: (body) => ({
        url: "/shipping",
        method: "POST",
        body,
      }),
    }),

    // 12. Stores
    getStores: builder.query<ApiResponse<StoreItem[]>, void>({
      query: () => "/stores",
    }),

    // 13. Lookbooks
    getLookbooks: builder.query<ApiResponse<{ lookbooks: LookbookItem[]; total: number } | LookbookItem[]>, void>({
      query: () => "/lookbooks",
    }),

    // 14. Abandoned Carts
    getAbandonedCarts: builder.query<ApiResponse<unknown>, void>({
      query: () => "/abandoned-carts/summary",
    }),

    // 15. Sustainability
    getSustainability: builder.query<ApiResponse<unknown>, void>({
      query: () => "/sustainability/initiatives",
    }),

    // 16. Currency & Exchange Rates
    getCurrencyRates: builder.query<ApiResponse<CurrencyRatesResponse>, void>({
      query: () => "/currency/rates",
      providesTags: ["Analytics"],
    }),

    convertCurrency: builder.query<ApiResponse<CurrencyConvertResponse>, { amount: number; from?: string; to?: string }>({
      query: (params) => ({
        url: "/currency/convert",
        params,
      }),
    }),

    detectCurrency: builder.mutation<ApiResponse<CurrencyDetectResponse>, void>({
      query: () => ({
        url: "/currency/detect",
        method: "POST",
      }),
    }),

    updateCurrencyRates: builder.mutation<ApiResponse<CurrencyRatesResponse>, UpdateRatesInput>({
      query: (body) => ({
        url: "/currency/rates",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Analytics"],
    }),

    // 17. MinIO Media Upload
    uploadImage: builder.mutation<
      ApiResponse<{ url: string; key: string; originalName: string; size: number }>,
      FormData
    >({
      query: (formData) => ({
        url: "/upload/image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const {
  useGetDashboardMetricsQuery,
  useGetInventoryAlertsQuery,
  useGetAdminProductsQuery,
  useGetPublicProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useGetAdminOrdersQuery,
  useGetOrderMetricsQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useGetBannersQuery,
  useGetUsersQuery,
  useGetFlashSalesQuery,
  useCreateFlashSaleMutation,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useGetStoresQuery,
  useGetLookbooksQuery,
  useGetAbandonedCartsQuery,
  useGetSustainabilityQuery,
  useGetCurrencyRatesQuery,
  useLazyConvertCurrencyQuery,
  useDetectCurrencyMutation,
  useUpdateCurrencyRatesMutation,
  useUploadImageMutation,
} = dashboardApi;
