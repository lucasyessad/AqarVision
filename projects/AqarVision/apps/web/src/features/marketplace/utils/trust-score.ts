/**
 * Trust Score — Calculates a 0-100 quality score for a listing.
 *
 * Scoring breakdown:
 *   - Photos présentes       max 30 pts : has_photos ? 30 : 0
 *   - Description complète   max 20 pts : description.length > 200 ? 20 : 10
 *   - Prix cohérent          max 20 pts : price > 0 ? 20 : 0
 *   - Agence vérifiée        max 30 pts : agency.is_verified ? 30 : 0
 *
 * Labels: 80+ = "Excellente qualité" | 60+ = "Bonne qualité" | 40+ = "Qualité correcte" | <40 = "Incomplet"
 */

export interface ListingForScore {
  /** Whether the listing has at least one photo */
  has_photos: boolean;
  /** Listing description text (can be empty string) */
  description: string;
  /** Current price — must be > 0 to be considered coherent */
  price: number;
  agency: {
    is_verified: boolean;
  };
}

/**
 * Calculates a 0-100 trust score for a listing.
 */
export function calculateTrustScore(listing: ListingForScore): number {
  let score = 0;

  // Photos (max 30 pts)
  if (listing.has_photos) {
    score += 30;
  }

  // Description (max 20 pts)
  if (listing.description.length > 200) {
    score += 20;
  } else if (listing.description.length > 0) {
    score += 10;
  }

  // Price coherence (max 20 pts)
  if (listing.price > 0) {
    score += 20;
  }

  // Verified agency (max 30 pts)
  if (listing.agency.is_verified) {
    score += 30;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Returns a human-readable quality label for a trust score.
 */
export function getTrustLabel(score: number): string {
  if (score >= 80) return "Excellente qualité";
  if (score >= 60) return "Bonne qualité";
  if (score >= 40) return "Qualité correcte";
  return "Incomplet";
}

/**
 * Returns a Tailwind CSS color class for a trust score.
 * Used for text color on the badge.
 */
export function getTrustColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-500";
  return "text-gray-400";
}

/**
 * Returns a Tailwind CSS background color class for a trust score.
 * Used for badge background.
 */
export function getTrustBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-blue-50 border-blue-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
}
