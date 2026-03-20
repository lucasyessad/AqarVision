"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Building2,
  Users,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Palette,
  Bell,
  ImageIcon,
  ArrowRight,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Feature definitions — ordered by importance
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    key: "search",
    href: "/search",
    icon: Search,
    color: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    borderActive: "border-teal-500/60 dark:border-teal-500/40",
    hero: true,
  },
  {
    key: "pro",
    href: "/pro",
    icon: Building2,
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    borderActive: "border-amber-500/60 dark:border-amber-500/40",
    hero: true,
  },
  {
    key: "chaab",
    href: "/chaab",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    borderActive: "border-blue-500/60 dark:border-blue-500/40",
    hero: true,
  },
  {
    key: "estimation",
    href: "/estimer",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    borderActive: "border-green-500/60 dark:border-green-500/40",
    hero: false,
  },
  {
    key: "autoGenerate",
    href: "/deposer",
    icon: Sparkles,
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    borderActive: "border-amber-500/60 dark:border-amber-500/40",
    hero: false,
  },
  {
    key: "messaging",
    href: "/pro",
    icon: MessageSquare,
    color: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    borderActive: "border-blue-500/60 dark:border-blue-500/40",
    hero: false,
  },
  {
    key: "themes",
    href: "/pro",
    icon: Palette,
    color: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    borderActive: "border-purple-500/60 dark:border-purple-500/40",
    hero: false,
  },
  {
    key: "alerts",
    href: "/search",
    icon: Bell,
    color: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    borderActive: "border-teal-500/60 dark:border-teal-500/40",
    hero: false,
  },
  {
    key: "photoProcessing",
    href: "/deposer",
    icon: ImageIcon,
    color: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    borderActive: "border-green-500/60 dark:border-green-500/40",
    hero: false,
  },
] as const;

type FeatureKey = (typeof FEATURES)[number]["key"];

// ---------------------------------------------------------------------------
// Split features into primary (3) and secondary (6)
// ---------------------------------------------------------------------------
const PRIMARY_FEATURES = FEATURES.filter((f) => f.hero);
const SECONDARY_FEATURES = FEATURES.filter((f) => !f.hero);

// ---------------------------------------------------------------------------
// Feature card
// ---------------------------------------------------------------------------

function FeatureCard({
  feature,
  visible,
  delay,
  isActive,
  isDimmed,
  onToggle,
}: {
  feature: (typeof FEATURES)[number];
  visible: boolean;
  delay: number;
  isActive: boolean;
  isDimmed: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("marketing.featureGrid");
  const Icon = feature.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to card when spotlight opens on mobile
  useEffect(() => {
    if (isActive && cardRef.current) {
      const mq = window.matchMedia("(max-width: 767px)");
      if (mq.matches) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className={cn(
        // Entrance animation
        "transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        // Dimming
        isDimmed && "opacity-30 pointer-events-none scale-[0.98]",
      )}
      style={{ transitionDelay: visible && !isActive && !isDimmed ? `${delay}ms` : "0ms" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "group relative flex flex-col w-full h-full text-start rounded-lg",
          "bg-white dark:bg-stone-900/60",
          "border transition-all duration-300",
          isActive
            ? cn("shadow-md", feature.borderActive)
            : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm",
          feature.hero ? "px-5 py-4.5" : "px-4.5 py-4",
        )}
      >
        {/* Close button when active */}
        {isActive && (
          <span className="absolute top-2.5 end-2.5 p-0.5 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            <X size={12} aria-hidden="true" />
          </span>
        )}

        {/* Icon + Title inline */}
        <div className="flex items-center gap-3 mb-1.5">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg shrink-0 transition-transform duration-300 group-hover:scale-110",
              feature.iconBg,
              feature.hero ? "w-10 h-10" : "w-9 h-9",
            )}
          >
            <Icon size={feature.hero ? 20 : 18} className={feature.color} />
          </div>
          <h3 className={cn(
            "font-semibold text-stone-900 dark:text-stone-50",
            feature.hero ? "text-base" : "text-sm",
          )}>
            {t(`${feature.key}.title`)}
          </h3>
        </div>

        {/* Short description — only for hero cards */}
        {feature.hero && (
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug ps-[52px]">
            {t(`${feature.key}.description`)}
          </p>
        )}

        {/* Expanded FAQ content */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isActive ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0",
          )}
        >
          <div className="border-t border-stone-200 dark:border-stone-800 pt-4">
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
              {t(`${feature.key}.detail`)}
            </p>
            <ul className="space-y-1.5 mb-3">
              {(["bullet1", "bullet2", "bullet3"] as const).map((bk) => (
                <li key={bk} className="flex items-start gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", feature.iconBg)} />
                  {t(`${feature.key}.${bk}`)}
                </li>
              ))}
            </ul>
            <Link
              href={feature.href}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium transition-colors duration-fast",
                feature.color,
              )}
            >
              {t(`${feature.key}.cta`)}
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature Grid
// ---------------------------------------------------------------------------

export function FeatureGrid() {
  const t = useTranslations("marketing");
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState<FeatureKey | null>(null);

  // IntersectionObserver for entrance animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function handleToggle(key: FeatureKey) {
    setActiveKey((prev) => (prev === key ? null : key));
  }

  return (
    <section className="bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-900 py-16 lg:py-24">
      <div ref={ref} className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-10 transition-all duration-700 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-teal-600 dark:text-teal-400 mb-3">
            {t("featureGrid.sectionEyebrow")}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50">
            {t("featureGrid.sectionTitle")}
          </h2>
        </div>

        {/* Masonry grid — 3 columns, primaries taller then secondaries compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
          {FEATURES.map((feature, idx) => (
            <FeatureCard
              key={feature.key}
              feature={feature}
              visible={visible}
              delay={idx * 80}
              isActive={activeKey === feature.key}
              isDimmed={activeKey !== null && activeKey !== feature.key}
              onToggle={() => handleToggle(feature.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
