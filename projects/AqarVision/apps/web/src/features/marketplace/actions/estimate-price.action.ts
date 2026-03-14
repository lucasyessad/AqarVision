"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResult } from "@/features/marketplace/types/search.types";

const EstimateSchema = z.object({
  wilaya_code: z.string().min(1, "Wilaya requise"),
  surface_m2: z.coerce.number().min(10, "Surface minimum 10 m²").max(10000),
  property_type: z.string().min(1, "Type de bien requis"),
  rooms: z.coerce.number().min(1).max(20).optional(),
  listing_type: z.enum(["sale", "rent"], { required_error: "Type requis" }),
});

export type EstimateInput = z.infer<typeof EstimateSchema>;

export interface EstimateResult {
  price_min: number;
  price_max: number;
  price_median: number;
  currency: string;
  sample_count: number;
  source: "market" | "reference";
}

/**
 * Reference prices per m² per wilaya (DZD) — fallback when no market data.
 * Values are approximate medians based on 2024 Algerian real estate market data.
 */
const REFERENCE_PRICES_SALE: Record<string, number> = {
  "16": 140000, // Alger
  "09": 95000,  // Blida
  "31": 90000,  // Oran
  "25": 75000,  // Constantine
  "19": 70000,  // Sétif
  "35": 65000,  // Boumerdès
  "15": 85000,  // Tizi Ouzou
  "06": 80000,  // Béjaïa
  "34": 60000,  // Bordj Bou Arreridj
  "05": 65000,  // Batna
};
const REFERENCE_PRICES_RENT: Record<string, number> = {
  "16": 1200,   // Alger — DZD/m²/mois
  "09": 800,
  "31": 750,
  "25": 650,
  "19": 600,
  "35": 700,
  "15": 700,
  "06": 650,
  "34": 500,
  "05": 550,
};
const DEFAULT_PRICE_SALE = 55000; // DZD/m²
const DEFAULT_PRICE_RENT = 500;   // DZD/m²/mois

/** Rooms correction factor: fewer/more rooms than average adjust price ±5% per room */
function roomsCorrection(rooms: number | undefined): number {
  if (!rooms) return 1;
  const avgRooms = 3;
  return 1 + (rooms - avgRooms) * 0.05;
}

export async function estimatePrice(
  _prevState: ActionResult<EstimateResult> | null,
  formData: FormData
): Promise<ActionResult<EstimateResult>> {
  const raw = {
    wilaya_code: formData.get("wilaya_code"),
    surface_m2: formData.get("surface_m2"),
    property_type: formData.get("property_type"),
    rooms: formData.get("rooms") || undefined,
    listing_type: formData.get("listing_type"),
  };

  const parsed = EstimateSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors.map((e) => e.message).join(", "),
      },
    };
  }

  const { wilaya_code, surface_m2, property_type, rooms, listing_type } = parsed.data;

  const supabase = await createClient();

  // Try to find median price from existing listings
  const { data: listings } = await supabase
    .from("listings")
    .select("current_price, surface_m2")
    .eq("wilaya_code", wilaya_code)
    .eq("property_type", property_type)
    .eq("listing_type", listing_type)
    .eq("current_status", "published")
    .is("deleted_at", null)
    .not("surface_m2", "is", null)
    .not("current_price", "is", null)
    .gt("current_price", 0)
    .gt("surface_m2", 0)
    .limit(50);

  let source: "market" | "reference" = "reference";
  let pricePerM2: number;

  if (listings && listings.length >= 3) {
    // Calculate median price per m²
    source = "market";
    const prices = listings
      .map((l) => {
        const row = l as Record<string, unknown>;
        const p = row.current_price as number;
        const s = row.surface_m2 as number;
        return p / s;
      })
      .sort((a, b) => a - b);

    const mid = Math.floor(prices.length / 2);
    pricePerM2 =
      prices.length % 2 === 0
        ? ((prices[mid - 1] ?? 0) + (prices[mid] ?? 0)) / 2
        : (prices[mid] ?? 0);
  } else {
    // Use reference data
    const ref =
      listing_type === "sale"
        ? REFERENCE_PRICES_SALE[wilaya_code] ?? DEFAULT_PRICE_SALE
        : REFERENCE_PRICES_RENT[wilaya_code] ?? DEFAULT_PRICE_RENT;
    pricePerM2 = ref;
  }

  const correction = roomsCorrection(rooms);
  const basePrice = pricePerM2 * surface_m2 * correction;

  // Apply ±15% spread for range
  const spread = 0.15;
  const price_min = Math.round(basePrice * (1 - spread) / 1000) * 1000;
  const price_max = Math.round(basePrice * (1 + spread) / 1000) * 1000;
  const price_median = Math.round(basePrice / 1000) * 1000;

  return {
    success: true,
    data: {
      price_min,
      price_max,
      price_median,
      currency: "DZD",
      sample_count: listings?.length ?? 0,
      source,
    },
  };
}
