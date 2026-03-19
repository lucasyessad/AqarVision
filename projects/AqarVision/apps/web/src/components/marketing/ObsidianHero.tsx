"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { HeroSearchBar } from "@/components/marketing/HeroSearchBar";
import { ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Algerian geometric mandala SVG (Islamic star pattern — 8-pointed octagram)
// Common in Algerian zellij tilework and architecture
// ---------------------------------------------------------------------------
function AlgerianMandala({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      className="w-full h-full text-brand-500"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="150" cy="150" r="142" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      {/* 8-pointed star (octagram) */}
      <polygon
        points="150,20 171,99 242,58 201,129 280,150 201,171 242,242 171,201 150,280 129,201 58,242 99,171 20,150 99,129 58,58 129,99"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
      />
      {/* Intermediate ring */}
      <circle cx="150" cy="150" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {/* Inner 8-pointed star (smaller) */}
      <polygon
        points="150,72 163,116 206,93 182,132 228,150 182,168 206,207 163,184 150,228 137,184 94,207 118,168 72,150 118,132 94,93 137,116"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.3"
      />
      {/* Inner ring */}
      <circle cx="150" cy="150" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      {/* Center diamond */}
      <polygon
        points="150,118 174,150 150,182 126,150"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.5"
      />
      {/* Center dot */}
      <circle cx="150" cy="150" r="3" fill="currentColor" opacity="0.7" />
      {/* 8 corner dots at octagram tips */}
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
// Hero
// ---------------------------------------------------------------------------
export function ObsidianHero() {
  const t = useTranslations("marketing");

  const sectionRef = useRef<HTMLElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const boldText = t("heroBold");
  const chars = boldText.split("");

  // GSAP animations
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Dynamic import — graceful if GSAP not yet installed
    import("gsap").then(({ gsap }) => {
      import("@gsap/react").then(({ useGSAP: _ }) => {
        // SVG slow rotation (0.2 rpm → 300s per turn)
        gsap.to(svgRef.current, {
          rotation: 360,
          duration: 300,
          ease: "none",
          repeat: -1,
          transformOrigin: "center center",
        });

        // Char-by-char reveal on bold headline
        const validChars = charRefs.current.filter(Boolean);
        if (validChars.length > 0) {
          gsap.from(validChars, {
            opacity: 0,
            y: 60,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.4,
          });
        }

        // Fade in rest of hero content
        gsap.from([headlineRef.current], {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
        });

        // Mouse parallax (desktop only)
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const xTo = gsap.quickTo(svgWrapperRef.current, "x", { duration: 0.9, ease: "power1.out" });
          const yTo = gsap.quickTo(svgWrapperRef.current, "y", { duration: 0.9, ease: "power1.out" });

          const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 28;
            xTo(x);
            yTo(y);
          };

          window.addEventListener("mousemove", handleMouseMove);
          cleanup = () => window.removeEventListener("mousemove", handleMouseMove);
        }
      });
    }).catch(() => {
      // GSAP not available — CSS animations handle the fallback
    });

    return () => cleanup?.();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-stone-950 overflow-hidden flex items-center"
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Amber glow blob — behind SVG */}
      <div className="absolute top-1/2 right-[14%] -translate-y-1/2 w-[480px] h-[480px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-[18%] -translate-y-1/2 w-[320px] h-[320px] bg-brand-600/8 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Mandala — right side */}
      <div
        ref={svgWrapperRef}
        className="absolute right-[4%] top-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 lg:w-[440px] lg:h-[440px] pointer-events-none opacity-60"
      >
        <AlgerianMandala svgRef={svgRef} />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-2xl lg:max-w-[55%]">

          {/* Eyebrow */}
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-700/50 bg-brand-900/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              {t("heroBadge")}
            </span>
          </div>

          {/* Headline */}
          <div ref={headlineRef} className="mb-8">
            <p className="text-2xl md:text-3xl font-light text-stone-400 mb-1 animate-fade-in">
              {t("heroHeadline")}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-stone-50 tracking-tight leading-none mb-1">
              {chars.map((char, i) => (
                <span
                  key={i}
                  ref={(el) => { charRefs.current[i] = el; }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p className="text-2xl md:text-3xl font-light text-stone-400 animate-fade-in">
              {t("heroSuffix")}
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-stone-500 mb-10 max-w-lg leading-relaxed animate-fade-in">
            {t("heroSubtitle")}
          </p>

          {/* Search bar */}
          <div className="mb-8">
            <HeroSearchBar searchLabel={t("ctaSearch")} />
          </div>

          {/* Secondary CTA */}
          <div className="flex items-center gap-4 animate-fade-in">
            <Link
              href="/deposer"
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-700",
                "text-sm font-medium text-stone-300 hover:text-stone-100 hover:border-stone-500 hover:bg-stone-900",
                "transition-colors duration-fast"
              )}
            >
              {t("ctaSecondary")} →
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce opacity-50">
        <span className="text-xs font-medium tracking-widest uppercase text-stone-500">
          {t("scrollDown")}
        </span>
        <ChevronDown size={18} className="text-stone-500" />
      </div>
    </section>
  );
}
