import { SEARCH } from '@/config';
import type { TrustLevel } from '@/types/database';

interface TrustScoreInput {
  images?: string[] | null;
  description?: string | null;
  price?: number | null;
  wilaya?: string | null;
  commune?: string | null;
  city?: string | null;
  agency_plan?: string | null;
}

const WEIGHTS = {
  images: 0.25,
  description: 0.20,
  price: 0.15,
  location: 0.15,
  agency: 0.25,
} as const;

export function calculateTrustScore(input: TrustScoreInput): number {
  let score = 0;

  // Images (25%)
  const imageCount = input.images?.length || 0;
  if (imageCount >= SEARCH.MIN_IMAGES_FOR_HIGH_TRUST) {
    score += WEIGHTS.images * 100;
  } else if (imageCount > 0) {
    score += WEIGHTS.images * (imageCount / SEARCH.MIN_IMAGES_FOR_HIGH_TRUST) * 100;
  }

  // Description (20%)
  const descLen = input.description?.length || 0;
  if (descLen >= 200) {
    score += WEIGHTS.description * 100;
  } else if (descLen >= 50) {
    score += WEIGHTS.description * 70;
  } else if (descLen > 0) {
    score += WEIGHTS.description * 30;
  }

  // Price (15%)
  if (input.price && input.price > 0) {
    score += WEIGHTS.price * 100;
  }

  // Location (15%)
  const hasLocation = !!(input.wilaya || input.commune || input.city);
  if (hasLocation) {
    score += WEIGHTS.location * 100;
  }

  // Agency (25%)
  if (input.agency_plan === 'enterprise') {
    score += WEIGHTS.agency * 100;
  } else if (input.agency_plan === 'pro') {
    score += WEIGHTS.agency * 70;
  } else {
    score += WEIGHTS.agency * 40;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function getTrustLevel(score: number): TrustLevel {
  if (score >= SEARCH.TRUST_SCORE_HIGH) return 'high';
  if (score >= SEARCH.TRUST_SCORE_MEDIUM) return 'medium';
  return 'low';
}
