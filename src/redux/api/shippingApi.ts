import { baseApi, type ApiResponse } from "./baseApi";
import type { ShippingZoneItem, CreateShippingZoneInput } from "@/types/shipping";

export const shippingApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShippingZones: builder.query<
      ApiResponse<{ zones: ShippingZoneItem[]; total: number } | ShippingZoneItem[]>,
      void
    >({
      query: () => "/shipping",
      providesTags: ["Shipping"],
    }),

    createShippingZone: builder.mutation<ApiResponse<ShippingZoneItem>, CreateShippingZoneInput>({
      query: (body) => ({
        url: "/shipping",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingZone: builder.mutation<
      ApiResponse<ShippingZoneItem>,
      { id: string; data: Partial<CreateShippingZoneInput> }
    >({
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
  }),
});

export const {
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useToggleShippingZoneStatusMutation,
} = shippingApi;
