'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const estimateSchema = z.object({
  type: z.string(),
  transaction_type: z.enum(['sale', 'rent']),
  wilaya: z.string(),
  commune: z.string().optional(),
  surface: z.number().positive(),
  rooms: z.number().optional(),
});

type EstimateInput = z.infer<typeof estimateSchema>;

interface ComparableRow {
  price: number;
  surface: number;
  wilaya: string | null;
  commune: string | null;
}

interface EstimateResult {
  estimated_price?: number;
  price_per_sqm?: number;
  price_range?: { min: number; max: number };
  comparables_count?: number;
  confidence?: 'low' | 'medium' | 'high';
  error?: string;
}

export async function estimatePrice(rawInput: EstimateInput): Promise<EstimateResult> {
  const parsed = estimateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: 'Données invalides: ' + parsed.error.errors[0]?.message };
  }

  const validated = parsed.data;

  const supabase = await createClient();

  const surfaceMin = validated.surface * 0.6;
  const surfaceMax = validated.surface * 1.4;

  const runQuery = async (byCommune: boolean): Promise<ComparableRow[] | null> => {
    let query = supabase
      .from('search_properties_view')
      .select('price, surface, wilaya, commune')
      .eq('transaction_type', validated.transaction_type)
      .eq('type', validated.type)
      .gte('surface', surfaceMin)
      .lte('surface', surfaceMax)
      .not('surface', 'is', null)
      .gt('price', 0)
      .limit(50);

    if (byCommune && validated.commune) {
      query = query.eq('commune', validated.commune);
    } else {
      query = query.eq('wilaya', validated.wilaya);
    }

    const { data } = await query;
    return data as ComparableRow[] | null;
  };

  let comparables = await runQuery(!!validated.commune);

  // Fallback to wilaya if commune has < 3 results
  if (comparables && comparables.length < 3 && validated.commune) {
    comparables = await runQuery(false);
  }

  if (!comparables || comparables.length === 0) {
    return { error: 'Pas assez de données pour estimer le prix dans cette zone.' };
  }

  // Calculate price per sqm for each comparable
  const prices = comparables
    .filter((c) => c.price > 0 && c.surface > 0)
    .map((c) => c.price / c.surface);

  if (prices.length === 0) {
    return { error: 'Pas assez de données valides pour estimer le prix.' };
  }

  prices.sort((a, b) => a - b);

  // Median
  const mid = Math.floor(prices.length / 2);
  const medianPricePerSqm =
    prices.length % 2 !== 0
      ? prices[mid]
      : (prices[mid - 1] + prices[mid]) / 2;

  const estimatedPrice = Math.round(medianPricePerSqm * validated.surface);

  const q1Index = Math.floor(prices.length * 0.25);
  const q3Index = Math.floor(prices.length * 0.75);
  const q1 = prices[q1Index] ?? prices[0];
  const q3 = prices[q3Index] ?? prices[prices.length - 1];

  const confidence: 'low' | 'medium' | 'high' =
    comparables.length < 3 ? 'low' : comparables.length < 10 ? 'medium' : 'high';

  return {
    estimated_price: estimatedPrice,
    price_per_sqm: Math.round(medianPricePerSqm),
    price_range: {
      min: Math.round(q1 * validated.surface),
      max: Math.round(q3 * validated.surface),
    },
    comparables_count: comparables.length,
    confidence,
  };
}
