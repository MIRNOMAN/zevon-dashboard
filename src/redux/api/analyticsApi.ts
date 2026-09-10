import { baseApi, type ApiResponse } from "./baseApi";
import type {
  DashboardMetrics,
  InventoryAlertItem,
  InventoryAlertsResponse,
} from "@/types/analytics";

export const analyticsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<ApiResponse<DashboardMetrics>, void>({
      query: () => "/analytics/dashboard",
      providesTags: ["Analytics"],
    }),

    getInventoryAlerts: builder.query<
      ApiResponse<InventoryAlertsResponse | InventoryAlertItem[]>,
      { threshold?: number } | void
    >({
      query: (params) => ({
        url: "/analytics/inventory-alerts",
        params: params ? { threshold: params.threshold } : undefined,
      }),
      providesTags: ["Product"],
    }),

    getInventoryKanban: builder.query<ApiResponse<unknown>, void>({
      query: () => "/analytics/inventory-kanban",
      providesTags: ["Product"],
    }),

    getSalesReport: builder.query<ApiResponse<unknown>, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/analytics/sales-report",
        params: params ?? undefined,
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetInventoryAlertsQuery,
  useGetInventoryKanbanQuery,
  useGetSalesReportQuery,
} = analyticsApi;
