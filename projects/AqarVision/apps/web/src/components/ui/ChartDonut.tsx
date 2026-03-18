"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface ChartDonutDataItem {
  name: string;
  value: number;
  color: string;
}

export interface ChartDonutProps {
  data: ChartDonutDataItem[];
  label?: string;
  className?: string;
}

export function ChartDonut({ data, label, className }: ChartDonutProps) {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn("w-full", className)} role="img" aria-label={label ?? "Donut chart"}>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-white, #fff)",
                borderColor: "var(--color-stone-200, #e7e5e4)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString("fr-FR")} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-xs text-stone-600 dark:text-stone-400">
              {item.name}
            </span>
            <span className="text-xs font-medium text-stone-900 dark:text-stone-100 tabular-nums">
              {item.value.toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
