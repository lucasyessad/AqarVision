import type { ListingDto } from "./listing.types";

export interface ListingPublishError {
  field: string;
  message: string;
}

export function canPublishListing(listing: ListingDto): {
  allowed: boolean;
  errors: ListingPublishError[];
} {
  const errors: ListingPublishError[] = [];

  const hasFrTranslation = listing.translations.some(
    (t) => t.locale === "fr" && t.title.trim().length > 0 && t.description.trim().length > 0
  );
  if (!hasFrTranslation) {
    errors.push({
      field: "translations",
      message: "French translation (title + description) is required",
    });
  }

  const hasArTranslation = listing.translations.some(
    (t) => t.locale === "ar" && t.title.trim().length > 0 && t.description.trim().length > 0
  );
  if (!hasArTranslation) {
    errors.push({
      field: "translations",
      message: "Arabic translation (title + description) is required",
    });
  }

  const hasCoverMedia = listing.media.some((m) => m.isCover && m.type === "image");
  if (!hasCoverMedia) {
    errors.push({
      field: "media",
      message: "A cover image is required",
    });
  }

  if (listing.price <= 0) {
    errors.push({
      field: "price",
      message: "Price must be greater than 0",
    });
  }

  return {
    allowed: errors.length === 0,
    errors,
  };
}
