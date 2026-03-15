export interface CollectionDto {
  id: string;
  name: string;
  created_at: string;
  favorite_count: number;
}

export interface CollectionFavoriteDto {
  id: string;
  listing_id: string;
  collection_id: string | null;
  created_at: string;
  listing_title: string;
}

export type { ActionResult } from "@/types/action-result";
