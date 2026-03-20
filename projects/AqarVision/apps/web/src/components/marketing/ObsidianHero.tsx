"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { HeroSearchBar } from "@/components/marketing/HeroSearchBar";
import { ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Animated counter hook (ease-out cubic, respects prefers-reduced-motion)
// ---------------------------------------------------------------------------
function useCountUp(target: number, isVisible: boolean, duration = 1800): number {
  const [count, setCount] = useState(0);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!isVisible) return;
    if (prefersReducedMotion) { setCount(target); return; }

    let startTime: number | null = null;
    let rafId: number;

    function animate(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, target, duration, prefersReducedMotion]);

  return count;
}

// ---------------------------------------------------------------------------
// Algerian geometric mandala SVG (Islamic star pattern — 8-pointed octagram)
// ---------------------------------------------------------------------------
function AlgerianMandala({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full h-full text-teal-600 dark:text-teal-500"
      aria-hidden="true"
    >
      <circle cx="150" cy="150" r="142" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <polygon
        points="150,20 171,99 242,58 201,129 280,150 201,171 242,242 171,201 150,280 129,201 58,242 99,171 20,150 99,129 58,58 129,99"
        fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45"
      />
      <circle cx="150" cy="150" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <polygon
        points="150,72 163,116 206,93 182,132 228,150 182,168 206,207 163,184 150,228 137,184 94,207 118,168 72,150 118,132 94,93 137,116"
        fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.3"
      />
      <circle cx="150" cy="150" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <polygon points="150,118 174,150 150,182 126,150" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      <circle cx="150" cy="150" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="150" cy="20" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="242" cy="58" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="280" cy="150" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="242" cy="242" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="150" cy="280" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="58" cy="242" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="20" cy="150" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="58" cy="58" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Stagger delay helper — base delay + index offset (ms)
// ---------------------------------------------------------------------------
function stagger(base: number, index: number, step = 35): string {
  return `${base + index * step}ms`;
}

// ---------------------------------------------------------------------------
// Hero stats badge — pill per KPI, animated counters, data from Supabase
// ---------------------------------------------------------------------------
interface HeroStat {
  value: number;
  suffix: string;
  labelKey: string;
}

function HeroStatsBadge({ delay, stats }: { delay: number; stats: HeroStat[] }) {
  const t = useTranslations("marketing");
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="hero-reveal mb-6 flex flex-wrap items-center gap-1.5" style={{ animationDelay: `${delay}ms` }}>
      {stats.map((stat) => (
        <HeroStatPill key={stat.labelKey} stat={stat} isVisible={isVisible} label={t(stat.labelKey)} />
      ))}
    </div>
  );
}

function HeroStatPill({ stat, isVisible, label }: { stat: HeroStat; isVisible: boolean; label: string }) {
  const count = useCountUp(stat.value, isVisible);

  return (
    <span className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full border border-teal-500/40 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] font-semibold tracking-wide uppercase">
      <span className="w-1 h-1 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
      {count.toLocaleString("fr-FR")}{stat.suffix} {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export function ObsidianHero({ stats }: { stats: HeroStat[] }) {
  const t = useTranslations("marketing");

  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const boldText = t("heroBold");
  const chars = boldText.split("");

  // GSAP only for SVG rotation + mouse parallax (non-critical, progressive)
  useEffect(() => {
    let gsapCtx: { revert: () => void } | undefined;
    let removeMouseMove: (() => void) | undefined;

    import("gsap").then(({ gsap }) => {
      gsapCtx = gsap.context(() => {
        gsap.to(svgRef.current, {
          rotation: 360,
          duration: 300,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
        });

        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const xTo = gsap.quickTo(svgWrapperRef.current, "x", { duration: 0.9, ease: "power1.out" });
          const yTo = gsap.quickTo(svgWrapperRef.current, "y", { duration: 0.9, ease: "power1.out" });

          const onMouseMove = (e: MouseEvent) => {
            xTo((e.clientX / window.innerWidth - 0.5) * 40);
            yTo((e.clientY / window.innerHeight - 0.5) * 28);
          };

          window.addEventListener("mousemove", onMouseMove);
          removeMouseMove = () => window.removeEventListener("mousemove", onMouseMove);
        }
      });
    }).catch(() => {});

    return () => {
      gsapCtx?.revert();
      removeMouseMove?.();
    };
  }, []);

  // Timing anchors (ms) for the sequential CSS reveal
  const T_BADGE    = 100;
  const T_PREFIX   = 300;
  const T_CHARS    = 500;
  const T_SUFFIX   = T_CHARS + chars.length * 35 - 100;
  const T_SUBTITLE = T_SUFFIX + 200;
  const T_SEARCH   = T_SUBTITLE + 200;
  const T_CTA      = T_SEARCH + 200;

  return (
    <section className="relative min-h-screen bg-stone-50 dark:bg-stone-950 overflow-hidden flex items-center">

      {/* Grain texture — dark mode only */}
      <div className="bg-noise absolute inset-0 opacity-[0.04] pointer-events-none hidden dark:block" />

      {/* Ambient glow — teal in light, amber in dark */}
      <div className="absolute top-1/2 right-[14%] -translate-y-1/2 w-[520px] h-[520px] bg-teal-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[300px] h-[300px] bg-teal-300/8 dark:bg-amber-600/8 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Mandala — right side */}
      <div
        ref={svgWrapperRef}
        className="absolute right-[4%] top-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 lg:w-[440px] lg:h-[440px] pointer-events-none opacity-25 dark:opacity-55"
      >
        <AlgerianMandala svgRef={svgRef} />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-2xl lg:max-w-[55%]">

          {/* Stats badge */}
          <HeroStatsBadge delay={T_BADGE} stats={stats} />

          {/* Headline */}
          <div className="mb-8">
            <p className="hero-reveal text-2xl md:text-3xl font-light text-stone-500 dark:text-stone-300 mb-1" style={{ animationDelay: `${T_PREFIX}ms` }}>
              {t("heroHeadline")}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-stone-900 dark:text-stone-50 tracking-tight leading-none mb-1">
              {chars.map((char, i) => (
                <span
                  key={i}
                  className="hero-char"
                  style={{ animationDelay: stagger(T_CHARS, i) }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p className="hero-reveal text-2xl md:text-3xl font-light text-stone-500 dark:text-stone-300" style={{ animationDelay: `${T_SUFFIX}ms` }}>
              {t("heroSuffix")}
            </p>
          </div>

          {/* Subtitle */}
          <p className="hero-reveal text-base md:text-lg text-stone-500 dark:text-stone-400 mb-10 max-w-lg leading-relaxed" style={{ animationDelay: `${T_SUBTITLE}ms` }}>
            {t("heroSubtitle")}
          </p>

          {/* Search bar */}
          <div className="hero-reveal mb-8" style={{ animationDelay: `${T_SEARCH}ms` }}>
            <HeroSearchBar searchLabel={t("ctaSearch")} />
          </div>

          {/* Secondary CTA */}
          <div className="hero-reveal flex items-center gap-4" style={{ animationDelay: `${T_CTA}ms` }}>
            <Link
              href="/deposer"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg",
                "border border-stone-300 dark:border-stone-700",
                "text-sm font-medium text-stone-600 dark:text-stone-300",
                "hover:text-stone-900 dark:hover:text-stone-100",
                "hover:border-stone-400 dark:hover:border-stone-500",
                "hover:bg-stone-100 dark:hover:bg-stone-900",
                "transition-colors duration-fast"
              )}
            >
              {t("ctaSecondary")} →
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce opacity-40">
        <span className="text-xs font-medium tracking-widest uppercase text-stone-400 dark:text-stone-500">
          {t("scrollDown")}
        </span>
        <ChevronDown size={18} className="text-stone-400 dark:text-stone-500" />
      </div>
    </section>
  );
}
