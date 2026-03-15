import { describe, it, expect, vi } from "vitest";

// Mock @aqarvision/config pour éviter la validation des vars d'env au chargement du module
vi.mock("@aqarvision/config", () => ({
  LOCALES: ["fr", "ar", "en", "es"],
  DEFAULT_LOCALE: "fr",
  SUPPORTED_CURRENCIES: ["DZD", "EUR", "USD"],
}));
import {
  UpsertTranslationSchema,
  CreateListingSchema,
  ChangePriceSchema,
} from "@/features/listings/schemas/listing.schema";
import { IndividualListingSchema } from "@/features/listings/schemas/individual-listing.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

// ---------------------------------------------------------------------------
// UpsertTranslationSchema
// ---------------------------------------------------------------------------

describe("UpsertTranslationSchema", () => {
  const validPayload = {
    listing_id: validUuid,
    locale: "fr" as const,
    title: "Bel appartement centre-ville",
    description: "Appartement entièrement rénové avec vue sur mer.",
    slug: "bel-appartement-centre-ville",
  };

  it("valide un objet correct", () => {
    const result = UpsertTranslationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejette un slug avec des majuscules", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      slug: "Bel-Appartement",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/lowercase/i);
  });

  it("rejette un slug contenant des espaces", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      slug: "bel appartement",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un slug avec des caractères spéciaux non autorisés", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      slug: "bel_appartement!",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un titre trop court (moins de 3 caractères)", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      title: "Ab",
    });
    expect(result.success).toBe(false);
  });

  it("applique sanitizeInput sur le title : supprime les balises HTML", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      title: "Titre <script>xss</script>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).not.toContain("<script>");
      expect(result.data.title).toContain("&lt;script&gt;");
    }
  });

  it("applique sanitizeInput sur la description : escape le HTML", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      description: "Description avec <b>gras</b> et & esperluette.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).not.toContain("<b>");
      expect(result.data.description).toContain("&lt;b&gt;");
      expect(result.data.description).toContain("&amp;");
    }
  });

  it("rejette une description trop courte (moins de 10 caractères)", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      description: "Court",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un listing_id qui n'est pas un UUID", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      listing_id: "pas-un-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une locale invalide", () => {
    const result = UpsertTranslationSchema.safeParse({
      ...validPayload,
      locale: "de",
    });
    expect(result.success).toBe(false);
  });

  it("accepte toutes les locales valides", () => {
    for (const locale of ["fr", "ar", "en", "es"] as const) {
      const result = UpsertTranslationSchema.safeParse({ ...validPayload, locale });
      expect(result.success, `locale "${locale}" devrait être valide`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// CreateListingSchema
// ---------------------------------------------------------------------------

describe("CreateListingSchema", () => {
  const validPayload = {
    agency_id: validUuid,
    listing_type: "sale" as const,
    property_type: "apartment" as const,
    current_price: 15000000,
    wilaya_code: "16",
  };

  it("valide un objet minimal correct", () => {
    const result = CreateListingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("valide un objet complet avec les champs optionnels", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      branch_id: validUuid,
      commune_id: 1601,
      surface_m2: 120,
      rooms: 4,
      bathrooms: 2,
      details: { has_elevator: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejette un current_price négatif", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      current_price: -1000,
    });
    expect(result.success).toBe(false);
  });

  it("accepte current_price = 0 (nonnegative)", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      current_price: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un listing_type invalide", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      listing_type: "lease",
    });
    expect(result.success).toBe(false);
  });

  it("accepte tous les listing_type valides", () => {
    for (const listing_type of ["sale", "rent", "vacation"] as const) {
      const result = CreateListingSchema.safeParse({ ...validPayload, listing_type });
      expect(result.success, `listing_type "${listing_type}" devrait être valide`).toBe(true);
    }
  });

  it("rejette un property_type invalide", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      property_type: "houseboat",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un agency_id qui n'est pas un UUID", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      agency_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un wilaya_code vide", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      wilaya_code: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette des rooms décimaux (doit être entier)", () => {
    const result = CreateListingSchema.safeParse({
      ...validPayload,
      rooms: 3.5,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ChangePriceSchema
// ---------------------------------------------------------------------------

describe("ChangePriceSchema", () => {
  const validPayload = {
    listing_id: validUuid,
    new_price: 12000000,
    expected_version: 1,
  };

  it("valide un objet correct", () => {
    const result = ChangePriceSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("valide avec une raison optionnelle", () => {
    const result = ChangePriceSchema.safeParse({
      ...validPayload,
      reason: "Ajustement marché",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un new_price négatif", () => {
    const result = ChangePriceSchema.safeParse({
      ...validPayload,
      new_price: -500,
    });
    expect(result.success).toBe(false);
  });

  it("accepte new_price = 0 (nonnegative)", () => {
    const result = ChangePriceSchema.safeParse({
      ...validPayload,
      new_price: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un listing_id invalide", () => {
    const result = ChangePriceSchema.safeParse({
      ...validPayload,
      listing_id: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejette si expected_version est absent", () => {
    const { expected_version: _, ...rest } = validPayload;
    const result = ChangePriceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// IndividualListingSchema
// ---------------------------------------------------------------------------

describe("IndividualListingSchema", () => {
  const validPayload = {
    listing_type: "sale" as const,
    property_type: "apartment" as const,
    wilaya_code: "16",
    title: "Appartement moderne au centre d'Alger",
    current_price: 18500000,
  };

  it("valide un objet minimal correct", () => {
    const result = IndividualListingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("valide un objet complet avec tous les champs optionnels", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      commune_id: 1601,
      surface_m2: 95,
      rooms: 3,
      bathrooms: 1,
      details: {
        has_elevator: true,
        has_parking: true,
        has_balcony: false,
        has_pool: false,
        has_garden: false,
        furnished: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejette un titre de moins de 10 caractères", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      title: "Court",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("10");
    }
  });

  it("rejette un titre de 9 caractères exactement", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      title: "123456789",
    });
    expect(result.success).toBe(false);
  });

  it("accepte un titre de 10 caractères exactement", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      title: "1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("rejette current_price = 0 (doit être strictement positif)", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      current_price: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejette un current_price négatif", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      current_price: -1,
    });
    expect(result.success).toBe(false);
  });

  it("applique sanitizeInput sur le title", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      title: "Appartement <b>moderne</b> Alger",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).not.toContain("<b>");
      expect(result.data.title).toContain("&lt;b&gt;");
    }
  });

  describe("details : valeurs par défaut si absent", () => {
    it("fournit des valeurs par défaut quand details n'est pas fourni", () => {
      const result = IndividualListingSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.details).toEqual({
          has_elevator: false,
          has_parking: false,
          has_balcony: false,
          has_pool: false,
          has_garden: false,
          furnished: false,
        });
      }
    });

    it("fournit des valeurs par défaut pour les champs manquants dans details", () => {
      const result = IndividualListingSchema.safeParse({
        ...validPayload,
        details: { has_elevator: true },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.details.has_elevator).toBe(true);
        expect(result.data.details.has_parking).toBe(false);
        expect(result.data.details.has_balcony).toBe(false);
        expect(result.data.details.has_pool).toBe(false);
        expect(result.data.details.has_garden).toBe(false);
        expect(result.data.details.furnished).toBe(false);
      }
    });

    it("fournit des valeurs par défaut quand details est un objet vide", () => {
      const result = IndividualListingSchema.safeParse({
        ...validPayload,
        details: {},
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.details).toEqual({
          has_elevator: false,
          has_parking: false,
          has_balcony: false,
          has_pool: false,
          has_garden: false,
          furnished: false,
        });
      }
    });
  });

  it("rejette un listing_type invalide", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      listing_type: "swap",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un property_type invalide", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      property_type: "chalet",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un commune_id non-entier positif", () => {
    const result = IndividualListingSchema.safeParse({
      ...validPayload,
      commune_id: -5,
    });
    expect(result.success).toBe(false);
  });
});
