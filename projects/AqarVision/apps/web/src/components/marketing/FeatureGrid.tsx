"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";
import { Search, Building2, Users, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    key: "search" as const,
    href: "/search",
    icon: Search,
    gradient: "from-teal-500/10 to-transparent",
    iconColor: "text-teal-400",
    borderHover: "hover:border-teal-500/40",
    glowColor: "group-hover:shadow-teal-500/10",
  },
  {
    key: "pro" as const,
    href: "/pro",
    icon: Building2,
    gradient: "from-brand-500/10 to-transparent",
    iconColor: "text-brand-400",
    borderHover: "hover:border-brand-500/40",
    glowColor: "group-hover:shadow-brand-500/10",
  },
  {
    key: "chaab" as const,
    href: "/chaab",
    icon: Users,
    gradient: "from-blue-500/10 to-transparent",
    iconColor: "text-blue-400",
    borderHover: "hover:border-blue-500/40",
    glowColor: "group-hover:shadow-blue-500/10",
  },
] as const;

function FeatureCard({
  feature,
  visible,
  delay,
}: {
  feature: (typeof FEATURES)[number];
  visible: boolean;
  delay: number;
}) {
  const t = useTranslations("marketing.featureGrid");
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      <Link
        href={feature.href}
        className={cn(
          "group relative flex flex-col h-full p-8 rounded-2xl",
          "bg-stone-900/60 backdrop-blur-sm",
          "border border-stone-800 transition-all duration-normal",
          feature.borderHover,
          "hover:bg-stone-900/80",
          `hover:shadow-2xl ${feature.glowColor}`
        )}
      >
        {/* Gradient top accent */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-px rounded-t-2xl",
            "bg-gradient-to-r",
            feature.gradient
          )}
        />

        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-6",
            "bg-stone-800 transition-transform duration-normal group-hover:scale-110"
          )}
        >
          <Icon size={22} className={feature.iconColor} />
        </div>

        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-2">
          {t(`${feature.key}.eyebrow`)}
        </p>

        {/* Title */}
        <h3 className="text-xl font-bold text-stone-50 mb-3">
          {t(`${feature.key}.title`)}
        </h3>

        {/* Description */}
        <p className="text-sm text-stone-400 leading-relaxed flex-1">
          {t(`${feature.key}.description`)}
        </p>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-stone-400 group-hover:text-stone-200 transition-colors duration-fast">
          {t(`${feature.key}.cta`)}
          <ArrowRight
            size={14}
            className="transition-transform duration-fast group-hover:translate-x-1"
          />
        </div>
      </Link>
    </div>
  );
}

export function FeatureGrid() {
  const t = useTranslations("marketing");
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-stone-950 border-t border-stone-900 py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-14 transition-all duration-700 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3">
            La plateforme
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-50">
            {t("heroSuffix")}
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {FEATURES.map((feature, idx) => (
            <FeatureCard
              key={feature.key}
              feature={feature}
              visible={visible}
              delay={idx * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
