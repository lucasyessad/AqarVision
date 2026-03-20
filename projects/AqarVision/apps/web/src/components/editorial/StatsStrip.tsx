"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

export interface StatsStripProps {
  stats: StatItem[];
  className?: string;
}

function useCountUp(
  target: number,
  isVisible: boolean,
  duration = 2000
): number {
  const [count, setCount] = useState(0);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!isVisible) return;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let startTime: number | null = null;
    let rafId: number;

    function animate(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration, prefersReducedMotion]);

  return count;
}

function StatCounter({
  stat,
  isVisible,
}: {
  stat: StatItem;
  isVisible: boolean;
}) {
  const count = useCountUp(stat.value, isVisible);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 sm:text-4xl lg:text-5xl">
        {count.toLocaleString("fr-FR")}
        {stat.suffix && (
          <span className="text-2xl sm:text-3xl lg:text-4xl">{stat.suffix}</span>
        )}
      </span>
      <span className="text-sm text-stone-600 dark:text-stone-400 sm:text-base">
        {stat.label}
      </span>
    </div>
  );
}

export function StatsStrip({ stats, className }: StatsStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={cn(
        "bg-stone-100 dark:bg-stone-950 py-16 lg:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => (
            <StatCounter key={stat.label} stat={stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
