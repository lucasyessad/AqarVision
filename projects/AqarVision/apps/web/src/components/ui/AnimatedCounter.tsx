"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Extract numeric part
    const match = value.match(/^([\d,.\s]+)/);
    if (!match) return;

    const numericStr = match[1]!.replace(/[\s,]/g, "");
    const target = parseInt(numericStr, 10);
    if (isNaN(target) || target === 0) return;

    const suffix = value.slice(match[0].length);
    const prefix = "";

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.unobserve(el);

          const duration = 1500;
          const startTime = performance.now();

          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(value);
            }
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
