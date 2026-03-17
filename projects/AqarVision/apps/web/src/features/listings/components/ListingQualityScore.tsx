"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface QualityCriterion {
  key: string;
  met: boolean;
  weight: number;
}

interface ListingQualityScoreProps {
  hasPhotos: boolean;
  photoCount: number;
  hasDescription: boolean;
  descriptionLength: number;
  hasPrice: boolean;
  hasSurface: boolean;
  hasRooms: boolean;
  hasTitle: boolean;
  titleLength: number;
  hasLocation: boolean;
  hasPropertyType: boolean;
}

function computeCriteria(props: ListingQualityScoreProps): QualityCriterion[] {
  return [
    { key: "has_title", met: props.hasTitle && props.titleLength > 10, weight: 10 },
    { key: "has_photos", met: props.hasPhotos, weight: 15 },
    { key: "min_3_photos", met: props.photoCount >= 3, weight: 10 },
    { key: "has_description", met: props.hasDescription, weight: 10 },
    { key: "long_description", met: props.descriptionLength > 200, weight: 10 },
    { key: "has_price", met: props.hasPrice, weight: 15 },
    { key: "has_surface", met: props.hasSurface, weight: 10 },
    { key: "has_rooms", met: props.hasRooms, weight: 5 },
    { key: "has_location", met: props.hasLocation, weight: 10 },
    { key: "has_property_type", met: props.hasPropertyType, weight: 5 },
  ];
}

export function ListingQualityScore(props: ListingQualityScoreProps) {
  const t = useTranslations("listings");
  const criteria = computeCriteria(props);
  const score = criteria.reduce((sum, c) => sum + (c.met ? c.weight : 0), 0);

  const color =
    score >= 80
      ? "text-green-600 dark:text-green-400"
      : score >= 50
        ? "text-amber-500 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  const barColor =
    score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  const unmetCriteria = criteria.filter((c) => !c.met);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
      {/* Header with score */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {t("quality_score_title")}
        </h3>
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{score}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Criteria list */}
      <div className="space-y-2">
        {criteria.map((c) => (
          <div key={c.key} className="flex items-center gap-2">
            {c.met ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
            )}
            <span
              className={`text-xs ${
                c.met
                  ? "text-zinc-600 dark:text-zinc-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {t(`quality_${c.key}`)}
            </span>
          </div>
        ))}
      </div>

      {/* Improvement hint */}
      {unmetCriteria.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 p-3">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t("quality_improvement_hint", { count: unmetCriteria.length })}
          </p>
        </div>
      )}
    </div>
  );
}
