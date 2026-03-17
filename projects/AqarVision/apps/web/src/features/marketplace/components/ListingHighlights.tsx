"use client";

import { useTranslations } from "next-intl";
import { Sparkles, AlertTriangle } from "lucide-react";

interface Highlight {
  type: "positive" | "attention";
  key: string;
}

interface ListingHighlightsProps {
  surface: number | null;
  rooms: number | null;
  price: number;
  hasPhotos: boolean;
  hasDescription: boolean;
  propertyType: string;
  listingType: string;
  details: Record<string, unknown>;
}

function extractHighlights(props: ListingHighlightsProps): Highlight[] {
  const highlights: Highlight[] = [];

  // Positive highlights
  if (props.details.has_parking) highlights.push({ type: "positive", key: "has_parking" });
  if (props.details.has_elevator) highlights.push({ type: "positive", key: "has_elevator" });
  if (props.details.has_pool) highlights.push({ type: "positive", key: "has_pool" });
  if (props.details.has_garden) highlights.push({ type: "positive", key: "has_garden" });
  if (props.details.sea_view) highlights.push({ type: "positive", key: "sea_view" });
  if (props.details.has_balcony) highlights.push({ type: "positive", key: "has_balcony" });
  if (props.details.has_terrace) highlights.push({ type: "positive", key: "has_terrace" });
  if (props.details.has_ac) highlights.push({ type: "positive", key: "has_ac" });

  // Attention points
  if (!props.hasPhotos) highlights.push({ type: "attention", key: "no_photos" });
  if (props.surface && props.rooms && props.rooms > 0 && props.surface / props.rooms < 12) {
    highlights.push({ type: "attention", key: "small_rooms" });
  }

  return highlights.slice(0, 6);
}

export function ListingHighlights(props: ListingHighlightsProps) {
  const t = useTranslations("listings");
  const highlights = extractHighlights(props);

  if (highlights.length === 0) return null;

  const positives = highlights.filter((h) => h.type === "positive");
  const attentions = highlights.filter((h) => h.type === "attention");

  return (
    <div className="space-y-3">
      {positives.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-green-500" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("highlights_positive")}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {positives.map((h) => (
              <span
                key={h.key}
                className="rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400"
              >
                {t(`highlight_${h.key}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {attentions.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t("highlights_attention")}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attentions.map((h) => (
              <span
                key={h.key}
                className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
              >
                {t(`highlight_${h.key}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
