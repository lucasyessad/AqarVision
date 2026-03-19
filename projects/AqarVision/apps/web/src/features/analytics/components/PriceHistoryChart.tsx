"use client";

import { useTranslations } from "next-intl";
import { ChartLine } from "@/components/ui/ChartLine";
import { formatPrice } from "@/lib/format";
import type { PriceHistoryPoint } from "../types/analytics.types";

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  currency?: string;
}

export function PriceHistoryChart({
  data,
  currency = "DZD",
}: PriceHistoryChartProps) {
  if (data.length < 2) {
    return (
      <p className="text-xs text-stone-400 dark:text-stone-500 text-center py-4">
        Pas assez de données
      </p>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString("fr-DZ", {
      day: "2-digit",
      month: "short",
    }),
    value: point.price,
  }));

  return (
    <div>
      <ChartLine data={chartData} label="Prix" color="#0D9488" />
      <div className="mt-3 space-y-1">
        {data.map((point, i) => {
          if (i === 0) return null;
          const prev = data[i - 1];
          if (!prev) return null;
          const diff = point.price - prev.price;
          const isIncrease = diff > 0;

          return (
            <div key={point.date} className="flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-stone-400">
                {new Date(point.date).toLocaleDateString("fr-DZ")}
              </span>
              <span
                className={
                  isIncrease
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {isIncrease ? "+" : ""}
                {formatPrice(diff, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
