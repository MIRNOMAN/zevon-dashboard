import { baseApi, type ApiResponse } from "./baseApi";
import type { UploadImageResponse } from "@/types/upload";

export const uploadApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<ApiResponse<UploadImageResponse>, FormData>({
      query: (formData) => ({
        url: "/upload/image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
} = uploadApi;
