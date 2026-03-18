"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface ChartLineProps {
  data: { date: string; value: number }[];
  label: string;
  color?: string;
  className?: string;
}

export function ChartLine({
  data,
  label,
  color = "var(--color-teal-600)",
  className,
}: ChartLineProps) {
  const tEmpty = useTranslations("common.empty");

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-64",
          "text-sm text-stone-500 dark:text-stone-400",
          className
        )}
      >
        {tEmpty("noData")}
      </div>
    );
  }

  return (
    <div className={cn("w-full h-64", className)} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-stone-200 dark:stroke-stone-800"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="fill-stone-500 dark:fill-stone-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="fill-stone-500 dark:fill-stone-400"
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-white, #fff)",
              borderColor: "var(--color-stone-200, #e7e5e4)",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            labelStyle={{
              color: "var(--color-stone-500, #78716c)",
              fontWeight: 500,
            }}
            itemStyle={{
              color: "var(--color-stone-900, #1c1917)",
            }}
            formatter={(value: number) => [
              value.toLocaleString("fr-FR"),
              label,
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              strokeWidth: 2,
              stroke: "var(--color-white, #fff)",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
