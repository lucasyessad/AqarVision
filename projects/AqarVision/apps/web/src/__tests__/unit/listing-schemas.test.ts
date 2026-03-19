import { describe, it, expect } from "vitest";
import { createListingSchema } from "@/features/listings/schemas/listing.schema";

describe("createListingSchema", () => {
  const validListing = {
    listing_type: "sale" as const,
    property_type: "apartment" as const,
    wilaya_code: "16",
    commune_id: 1601,
    details: {
      area_m2: 120,
      rooms: 4,
      bathrooms: 2,
    },
    price: 15000000,
    currency: "DZD" as const,
    translations: [
      {
        locale: "fr" as const,
        title: "Appartement F4 lumineux à Alger Centre",
        description:
          "Magnifique appartement F4 situé au cœur d'Alger, lumineux et bien agencé. Surface de 120m², 4 pièces dont 2 chambres.",
      },
    ],
  };

  it("validates a correct listing", () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it("rejects invalid listing type", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      listing_type: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty translations", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      translations: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects title too short", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      translations: [
        { locale: "fr", title: "Short", description: "A".repeat(50) },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("sanitizes HTML in title", () => {
    const result = createListingSchema.safeParse({
      ...validListing,
      translations: [
        {
          locale: "fr",
          title: "<b>Appartement</b> F4 à Alger Centre",
          description: "A".repeat(50),
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.translations[0]!.title).not.toContain("<b>");
    }
  });
});
