import { baseApi, ApiResponse } from "./baseApi";

export interface SustainabilityMetrics {
  organicSourcingPercent: number;
  organicSourcingDescription: string;
  carbonOffsetPercent: number;
  carbonOffsetDescription: string;
  plasticFreePackagingPercent: number;
  plasticFreePackagingDescription: string;
  waterRecycledPercent: number;
  waterRecycledDescription: string;
  totalGarmentsRecycled: number;
  activeEcoInitiativesCount: number;
  lastUpdated?: string;
}

export interface SustainabilityStory {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const sustainabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSustainabilityMetrics: builder.query<ApiResponse<SustainabilityMetrics>, void>({
      query: () => ({
        url: "/sustainability/metrics",
        method: "GET",
      }),
      providesTags: ["Sustainability"],
    }),

    updateSustainabilityMetrics: builder.mutation<
      ApiResponse<SustainabilityMetrics>,
      Partial<SustainabilityMetrics>
    >({
      query: (body) => ({
        url: "/sustainability/metrics",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Sustainability"],
    }),

    getSustainabilityStories: builder.query<ApiResponse<SustainabilityStory[]>, void>({
      query: () => ({
        url: "/sustainability",
        method: "GET",
      }),
      providesTags: ["Sustainability"],
    }),

    createSustainabilityStory: builder.mutation<
      ApiResponse<SustainabilityStory>,
      {
        title: string;
        slug?: string;
        summary: string;
        content: string;
        coverImageUrl: string;
        isPublished?: boolean;
      }
    >({
      query: (body) => ({
        url: "/sustainability/stories",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sustainability"],
    }),

    updateSustainabilityStory: builder.mutation<
      ApiResponse<SustainabilityStory>,
      {
        id: string;
        data: Partial<{
          title: string;
          slug: string;
          summary: string;
          content: string;
          coverImageUrl: string;
          isPublished: boolean;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/sustainability/stories/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Sustainability"],
    }),

    deleteSustainabilityStory: builder.mutation<
      ApiResponse<{ success: boolean; message: string }>,
      string
    >({
      query: (id) => ({
        url: `/sustainability/stories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sustainability"],
    }),
  }),
});

export const {
  useGetSustainabilityMetricsQuery,
  useUpdateSustainabilityMetricsMutation,
  useGetSustainabilityStoriesQuery,
  useCreateSustainabilityStoryMutation,
  useUpdateSustainabilityStoryMutation,
  useDeleteSustainabilityStoryMutation,
} = sustainabilityApi;
