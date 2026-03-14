export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export interface FavoriteDto {
  id: string;
  listing_id: string;
  created_at: string;
}

export interface NoteDto {
  id: string;
  listing_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface SavedSearchDto {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  notify: boolean;
  created_at: string;
  updated_at: string;
}
