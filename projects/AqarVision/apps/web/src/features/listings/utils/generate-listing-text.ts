import type { ListingType, PropertyType } from "../schemas/listing.schema";
import type { ListingDetails } from "../types/listing.types";

interface GenerateTextInput {
  listingType: ListingType;
  propertyType: PropertyType;
  details: Partial<ListingDetails>;
  wilayaName: string;
  communeName: string;
  price?: number;
  currency?: string;
}

const PROPERTY_LABELS: Record<PropertyType, string> = {
  apartment: "Appartement",
  villa: "Villa",
  terrain: "Terrain",
  commercial: "Local commercial",
  office: "Bureau",
  building: "Immeuble",
  farm: "Ferme",
  warehouse: "Entrepôt",
};

const TYPE_LABELS: Record<ListingType, string> = {
  sale: "à vendre",
  rent: "à louer",
  vacation: "location vacances",
};

export function generateListingTitle(input: GenerateTextInput): string {
  const propertyLabel = PROPERTY_LABELS[input.propertyType];
  const typeLabel = TYPE_LABELS[input.listingType];
  const location = `${input.communeName}, ${input.wilayaName}`;

  const parts = [propertyLabel];

  if (input.details.rooms && input.details.rooms > 0) {
    parts.push(`F${input.details.rooms}`);
  }

  if (input.details.area_m2) {
    parts.push(`${input.details.area_m2}m²`);
  }

  parts.push(typeLabel);
  parts.push(location);

  return parts.join(" ");
}

export function generateListingDescription(input: GenerateTextInput): string {
  const propertyLabel = PROPERTY_LABELS[input.propertyType].toLowerCase();
  const typeLabel = TYPE_LABELS[input.listingType];
  const lines: string[] = [];

  lines.push(
    `${PROPERTY_LABELS[input.propertyType]} ${typeLabel} à ${input.communeName}, ${input.wilayaName}.`
  );

  if (input.details.area_m2) {
    lines.push(`Surface : ${input.details.area_m2} m².`);
  }

  if (input.details.rooms) {
    lines.push(
      `${input.details.rooms} pièce${input.details.rooms > 1 ? "s" : ""}.`
    );
  }

  if (input.details.bathrooms) {
    lines.push(
      `${input.details.bathrooms} salle${input.details.bathrooms > 1 ? "s" : ""} de bain.`
    );
  }

  if (input.details.floor !== undefined) {
    lines.push(`Étage ${input.details.floor}.`);
  }

  const features: string[] = [];
  if (input.details.has_parking) features.push("parking");
  if (input.details.has_elevator) features.push("ascenseur");
  if (input.details.has_balcony) features.push("balcon");
  if (input.details.has_pool) features.push("piscine");
  if (input.details.has_garden) features.push("jardin");
  if (input.details.furnished) features.push("meublé");
  if (input.details.has_sea_view) features.push("vue mer");

  if (features.length > 0) {
    lines.push(`Équipements : ${features.join(", ")}.`);
  }

  lines.push(`\nN'hésitez pas à nous contacter pour plus d'informations ou pour organiser une visite.`);

  return lines.join("\n");
}
