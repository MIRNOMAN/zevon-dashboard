// ---------------------------------------------------------------------------
// MinIO Media Upload Types
// ---------------------------------------------------------------------------

export interface UploadImageResponse {
  url: string;
  key: string;
  originalName: string;
  size: number;
}
