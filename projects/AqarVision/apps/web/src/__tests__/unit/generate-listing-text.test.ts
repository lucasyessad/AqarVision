import { describe, it, expect } from "vitest";
import {
  generateListingTitle,
  generateListingDescription,
} from "@/features/listings/utils/generate-listing-text";

describe("generateListingTitle", () => {
  it("includes property type label", () => {
    const title = generateListingTitle({
      listingType: "sale",
      propertyType: "apartment",
      details: { area_m2: 100 },
      wilayaName: "Alger",
      communeName: "Bab El Oued",
    });
    expect(title).toContain("Appartement");
  });

  it("includes rooms count when provided", () => {
    const title = generateListingTitle({
      listingType: "sale",
      propertyType: "apartment",
      details: { area_m2: 120, rooms: 4 },
      wilayaName: "Alger",
      communeName: "Hydra",
    });
    expect(title).toContain("F4");
  });

  it("includes area when provided", () => {
    const title = generateListingTitle({
      listingType: "rent",
      propertyType: "villa",
      details: { area_m2: 250 },
      wilayaName: "Oran",
      communeName: "Bir El Djir",
    });
    expect(title).toContain("250m²");
  });

  it("includes location", () => {
    const title = generateListingTitle({
      listingType: "sale",
      propertyType: "terrain",
      details: { area_m2: 500 },
      wilayaName: "Constantine",
      communeName: "El Khroub",
    });
    expect(title).toContain("El Khroub");
    expect(title).toContain("Constantine");
  });

  it("includes transaction type", () => {
    const titleSale = generateListingTitle({
      listingType: "sale",
      propertyType: "apartment",
      details: { area_m2: 80 },
      wilayaName: "Blida",
      communeName: "Blida",
    });
    expect(titleSale).toContain("vendre");

    const titleRent = generateListingTitle({
      listingType: "rent",
      propertyType: "apartment",
      details: { area_m2: 80 },
      wilayaName: "Blida",
      communeName: "Blida",
    });
    expect(titleRent).toContain("louer");
  });

  it("handles villa property type", () => {
    const title = generateListingTitle({
      listingType: "sale",
      propertyType: "villa",
      details: { area_m2: 300, rooms: 6 },
      wilayaName: "Tipaza",
      communeName: "Cherchell",
    });
    expect(title).toContain("Villa");
    expect(title).toContain("F6");
  });

  it("omits rooms when zero", () => {
    const title = generateListingTitle({
      listingType: "sale",
      propertyType: "terrain",
      details: { area_m2: 1000, rooms: 0 },
      wilayaName: "Setif",
      communeName: "Setif",
    });
    expect(title).not.toContain("F0");
  });
});

describe("generateListingDescription", () => {
  it("includes all provided details", () => {
    const desc = generateListingDescription({
      listingType: "sale",
      propertyType: "apartment",
      details: {
        area_m2: 120,
        rooms: 4,
        bathrooms: 2,
        floor: 3,
      },
      wilayaName: "Alger",
      communeName: "Hydra",
    });
    expect(desc).toContain("120 m²");
    expect(desc).toContain("4 pièces");
    expect(desc).toContain("2 salles de bain");
    expect(desc).toContain("Étage 3");
  });

  it("includes features in description", () => {
    const desc = generateListingDescription({
      listingType: "sale",
      propertyType: "villa",
      details: {
        area_m2: 250,
        has_parking: true,
        has_pool: true,
        has_garden: true,
        has_sea_view: true,
      },
      wilayaName: "Bejaia",
      communeName: "Bejaia",
    });
    expect(desc).toContain("parking");
    expect(desc).toContain("piscine");
    expect(desc).toContain("jardin");
    expect(desc).toContain("vue mer");
  });

  it("includes location information", () => {
    const desc = generateListingDescription({
      listingType: "rent",
      propertyType: "office",
      details: { area_m2: 80 },
      wilayaName: "Oran",
      communeName: "Oran Centre",
    });
    expect(desc).toContain("Oran Centre");
    expect(desc).toContain("Oran");
  });

  it("handles singular forms", () => {
    const desc = generateListingDescription({
      listingType: "sale",
      propertyType: "apartment",
      details: {
        area_m2: 40,
        rooms: 1,
        bathrooms: 1,
      },
      wilayaName: "Alger",
      communeName: "Kouba",
    });
    expect(desc).toContain("1 pièce.");
    expect(desc).toContain("1 salle de bain.");
  });

  it("omits features section when no features", () => {
    const desc = generateListingDescription({
      listingType: "sale",
      propertyType: "terrain",
      details: { area_m2: 500 },
      wilayaName: "Tlemcen",
      communeName: "Tlemcen",
    });
    expect(desc).not.toContain("Équipements");
  });

  it("includes contact prompt", () => {
    const desc = generateListingDescription({
      listingType: "sale",
      propertyType: "apartment",
      details: { area_m2: 100 },
      wilayaName: "Alger",
      communeName: "Alger Centre",
    });
    expect(desc).toContain("contacter");
  });
});
