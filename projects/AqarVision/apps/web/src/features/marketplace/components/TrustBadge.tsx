"use client";

import {
  calculateTrustScore,
  getTrustLabel,
  getTrustColor,
  getTrustBgColor,
  type ListingForScore,
} from "../utils/trust-score";

interface TrustBadgeProps {
  listing: ListingForScore;
  /** When true, shows the numeric score alongside the label */
  showScore?: boolean;
  /** CSS class override for the container */
  className?: string;
}

export function TrustBadge({
  listing,
  showScore = false,
  className = "",
}: TrustBadgeProps) {
  const score = calculateTrustScore(listing);
  const label = getTrustLabel(score);
  const textColor = getTrustColor(score);
  const bgBorderClass = getTrustBgColor(score);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${bgBorderClass} ${textColor} ${className}`}
      title={`Score de qualité : ${score}/100`}
    >
      {/* Shield icon */}
      <svg
        className="h-3 w-3 shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9.661 2.237a.75.75 0 01.678 0l7.5 3.75A.75.75 0 0118 6.75v.75c0 3.33-1.58 6.523-4.238 8.604a.75.75 0 01-.924 0C10.08 14.023 8.5 10.83 8.5 7.5v-.75a.75.75 0 01.5-.71l.661-.803zM10 3.75L3.5 7.035V7.5c0 2.832 1.33 5.538 3.5 7.334C9.17 13.038 10.5 10.332 10.5 7.5v-.465L4 3.75h6z"
          clipRule="evenodd"
        />
      </svg>
      {showScore ? `${label} (${score}/100)` : label}
    </span>
  );
}
