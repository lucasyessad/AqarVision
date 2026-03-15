"use client";

import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

interface StatsStripProps {
  stats: Stat[];
  statement?: string;
}

function AnimatedStat({ stat }: { stat: Stat }) {
  const { count, ref } = useAnimatedCounter(stat.value);
  return (
    <div className="text-center">
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="text-3xl font-bold tabular-nums text-amber-400 sm:text-4xl"
      >
        {count.toLocaleString("fr-DZ")}{stat.suffix ?? ""}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
    </div>
  );
}

export function StatsStrip({ stats, statement }: StatsStripProps) {
  return (
    <section className="bg-zinc-950 py-16 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-6">
        {statement && (
          <h2 className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl">
            {statement}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
