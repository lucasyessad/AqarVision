import type { ListingCard } from "@/features/listings/types/listing.types";

export interface FavoriteCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  listings_count: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  collection_id: string | null;
  created_at: string;
  listing: ListingCard;
}
