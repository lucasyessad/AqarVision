"use client";

import { useTranslations } from "next-intl";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface PriceChange {
  old_price: number;
  new_price: number;
  created_at: string;
}

interface PriceHistoryChartProps {
  history: PriceChange[];
  currency: string;
  locale: string;
}

export function PriceHistoryChart({ history, currency, locale }: PriceHistoryChartProps) {
  const t = useTranslations("listings");

  if (history.length === 0) return null;

  const prices = [history[0].old_price, ...history.map((h) => h.new_price)];
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  const latestChange = history[history.length - 1];
  const priceDiff = latestChange.new_price - latestChange.old_price;
  const pctChange = ((priceDiff / latestChange.old_price) * 100).toFixed(1);

  const TrendIcon = priceDiff > 0 ? TrendingUp : priceDiff < 0 ? TrendingDown : Minus;
  const trendColor = priceDiff > 0 ? "text-red-500" : priceDiff < 0 ? "text-green-500" : "text-zinc-400";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {t("price_history_title")}
        </h3>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5" />
          {priceDiff > 0 ? "+" : ""}{pctChange}%
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="mb-4 flex items-end gap-1">
        {prices.map((price, i) => {
          const height = ((price - minPrice) / range) * 60 + 8;
          return (
            <div
              key={i}
              className="flex-1 rounded-t bg-amber-500/20 dark:bg-amber-500/10 transition-all hover:bg-amber-500/40"
              style={{ height: `${height}px` }}
              title={formatPrice(price, currency)}
            />
          );
        })}
      </div>

      {/* History list */}
      <div className="space-y-2">
        {history.map((change, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 dark:text-zinc-500">
              {new Date(change.created_at).toLocaleDateString(locale)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 line-through">
                {formatPrice(change.old_price, currency)}
              </span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {formatPrice(change.new_price, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
