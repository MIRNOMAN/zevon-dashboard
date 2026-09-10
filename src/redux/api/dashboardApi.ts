import { baseApi, type ApiResponse } from "./baseApi";

// ---------------------------------------------------------------------------
// Dashboard Types matching zevon-server
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
  details?: string | null;
  fabricSpecs?: string | null;
  washCare?: string | null;
  tags?: string[];
  basePrice: number | string;
  discountPrice?: number | string | null;
  gender: string;
  season: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  category?: { id: string; name: string; slug: string };
  images?: Array<{ id?: string; url: string; isPrimary: boolean; altText?: string | null }>;
  variants?: Array<{ id: string; sku: string; stock: number; size: string; color: string; colorCode?: string }>;
  _count?: { variants: number; reviews: number };
  createdAt?: string;
  updatedAt?: string;
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
  mobileImageUrl?: string | null;
  ctaText?: string | null;
  linkUrl?: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateBannerInput {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  linkUrl?: string;
  placement?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReviewAdminItem {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  product?: {
    id: string;
    title: string;
    slug: string;
    basePrice: number | string;
    images?: Array<{ url: string; isPrimary: boolean }>;
  };
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

    getProductById: builder.query<ApiResponse<ProductItem>, string>({
      query: (id) => `/products/admin/${id}`,
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

    updateProduct: builder.mutation<ApiResponse<ProductItem>, { id: string; data: Partial<CreateProductInput> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product", "Analytics"],
    }),

    togglePublishProduct: builder.mutation<ApiResponse<ProductItem>, string>({
      query: (id) => ({
        url: `/products/${id}/toggle-publish`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
    }),

    toggleFeaturedProduct: builder.mutation<ApiResponse<ProductItem>, string>({
      query: (id) => ({
        url: `/products/${id}/toggle-featured`,
        method: "PATCH",
      }),
      invalidatesTags: ["Product"],
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

    getAdminCategories: builder.query<
      ApiResponse<CategoryAdminResponse | CategoryItem[]>,
      { page?: number; limit?: number; search?: string; parentId?: string; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: "/categories/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Category"],
    }),

    getCategoryTree: builder.query<ApiResponse<CategoryItem[]>, void>({
      query: () => "/categories/tree",
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<ApiResponse<CategoryItem>, CreateCategoryInput>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<ApiResponse<CategoryItem>, { id: string; data: Partial<CreateCategoryInput> }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    toggleCategoryStatus: builder.mutation<ApiResponse<CategoryItem>, string>({
      query: (id) => ({
        url: `/categories/${id}/toggle-status`,
        method: "PATCH",
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
    getBanners: builder.query<ApiResponse<BannerItem[]>, { placement?: string } | void>({
      query: (params) => ({
        url: "/banners",
        params: params ?? undefined,
      }),
      providesTags: ["Banner"],
    }),

    getAdminBanners: builder.query<
      ApiResponse<{ banners: BannerItem[]; total: number } | BannerItem[]>,
      { page?: number; limit?: number; placement?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/banners/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Banner"],
    }),

    createBanner: builder.mutation<ApiResponse<BannerItem>, CreateBannerInput>({
      query: (body) => ({
        url: "/banners",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Banner"],
    }),

    updateBanner: builder.mutation<ApiResponse<BannerItem>, { id: string; data: Partial<CreateBannerInput> }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),

    deleteBanner: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),

    toggleBannerStatus: builder.mutation<ApiResponse<BannerItem>, string>({
      query: (id) => ({
        url: `/banners/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Banner"],
    }),

    // 8. Reviews (Admin & Moderation)
    getAdminReviews: builder.query<
      ApiResponse<{ reviews: ReviewAdminItem[]; meta?: { total: number; page: number; totalPages: number } } | ReviewAdminItem[]>,
      { page?: number; limit?: number; rating?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/reviews/admin/all",
        params: params ?? undefined,
      }),
      providesTags: ["Review"],
    }),

    deleteReview: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Product"],
    }),

    // 9. Users
    getUsers: builder.query<ApiResponse<{ users: UserDirectoryItem[]; total: number } | UserDirectoryItem[]>, void>({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // 10. Flash Sales
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

    // 11. Returns
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

    // 12. Shipping Zones
    getShippingZones: builder.query<ApiResponse<{ zones: ShippingZoneItem[]; total: number } | ShippingZoneItem[]>, void>({
      query: () => "/shipping",
      providesTags: ["Shipping"],
    }),

    createShippingZone: builder.mutation<ApiResponse<ShippingZoneItem>, Record<string, unknown>>({
      query: (body) => ({
        url: "/shipping",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingZone: builder.mutation<ApiResponse<ShippingZoneItem>, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({
        url: `/shipping/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteShippingZone: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/shipping/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    toggleShippingZoneStatus: builder.mutation<ApiResponse<ShippingZoneItem>, string>({
      query: (id) => ({
        url: `/shipping/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Shipping"],
    }),

    // 13. Stores
    getStores: builder.query<ApiResponse<StoreItem[]>, void>({
      query: () => "/stores",
    }),

    // 14. Lookbooks
    getLookbooks: builder.query<ApiResponse<{ lookbooks: LookbookItem[]; total: number } | LookbookItem[]>, void>({
      query: () => "/lookbooks",
    }),

    // 15. Abandoned Carts
    getAbandonedCarts: builder.query<ApiResponse<unknown>, void>({
      query: () => "/abandoned-carts/summary",
    }),

    // 16. Sustainability
    getSustainability: builder.query<ApiResponse<unknown>, void>({
      query: () => "/sustainability/initiatives",
    }),

    // 17. Currency & Exchange Rates
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

    // 18. MinIO Media Upload
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
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useTogglePublishProductMutation,
  useToggleFeaturedProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useGetAdminOrdersQuery,
  useGetOrderMetricsQuery,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useGetBannersQuery,
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewMutation,
  useGetUsersQuery,
  useGetFlashSalesQuery,
  useCreateFlashSaleMutation,
  useGetReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useToggleShippingZoneStatusMutation,
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

