export interface MediaDto {
  id: string;
  listing_id: string;
  storage_path: string;
  content_type: string;
  file_size_bytes: number;
  width: number | null;
  height: number | null;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
  url: string;
}

export interface UploadUrlResult {
  signed_url: string;
  storage_path: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
