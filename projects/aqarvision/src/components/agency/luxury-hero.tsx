'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { Agency } from '@/types/database';

interface LuxuryHeroProps {
  agency: Agency;
}

/** Compteur animé avec easing cubique */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing cubique
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="luxury-animate-counter">
      {count}
      {suffix}
    </span>
  );
}

/** Extrait l'ID YouTube d'une URL */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function LuxuryHero({ agency }: LuxuryHeroProps) {
  const {
    hero_style,
    hero_video_url,
    cover_image_url,
    primary_color,
    secondary_color,
    theme_mode,
    logo_url,
    name,
    tagline,
    slogan,
    stats_years,
    stats_properties_sold,
    stats_clients,
  } = agency;

  const isDark = theme_mode === 'dark';
  const accentColor = secondary_color || primary_color;

  const overlayClass = isDark
    ? 'bg-gradient-to-b from-black/60 via-black/40 to-black/80'
    : 'bg-gradient-to-b from-white/50 via-white/30 to-white/70';

  const textColor = isDark ? 'text-white' : 'text-gray-900';

  const stats = [
    { value: stats_years, label: "Années d'expérience", suffix: '+' },
    { value: stats_properties_sold, label: 'Biens vendus', suffix: '+' },
    { value: stats_clients, label: 'Clients satisfaits', suffix: '+' },
  ].filter((s) => s.value != null && s.value > 0);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* === Background === */}
      {hero_style === 'video' && hero_video_url ? (
        <>
          {getYouTubeId(hero_video_url) ? (
            <iframe
              className="absolute inset-0 h-full w-full object-cover"
              src={`https://www.youtube.com/embed/${getYouTubeId(hero_video_url)}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&playlist=${getYouTubeId(hero_video_url)}`}
              allow="autoplay; fullscreen"
              style={{ border: 0, pointerEvents: 'none' }}
              title="Hero video"
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={hero_video_url}
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </>
      ) : hero_style === 'cover' && cover_image_url ? (
        <Image
          src={cover_image_url}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: primary_color }}
        />
      )}

      {/* === Overlay === */}
      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* === Content === */}
      <div className={`relative z-10 flex h-full flex-col items-center justify-center px-6 ${textColor}`}>
        {/* Logo */}
        {logo_url && (
          <div className="luxury-animate-scale-in mb-8">
            <Image
              src={logo_url}
              alt={`${name} logo`}
              width={120}
              height={120}
              className="h-24 w-24 rounded-full object-cover shadow-2xl md:h-32 md:w-32"
            />
          </div>
        )}

        {/* Nom de l'agence */}
        <h1 className="font-display-classic text-display-xl text-center luxury-animate-fade-in-up">
          {name}
        </h1>

        {/* Trait décoratif */}
        <div
          className="luxury-animate-line-grow mx-auto mt-6 h-0.5"
          style={{ backgroundColor: accentColor }}
        />

        {/* Tagline ou slogan */}
        {(tagline || slogan) && (
          <p className="luxury-animate-fade-in-delayed mt-6 max-w-2xl text-center text-lg tracking-wide opacity-90 md:text-xl">
            {tagline || slogan}
          </p>
        )}

        {/* CTA */}
        <a
          href={`/agence/${agency.slug}/biens`}
          className="luxury-animate-fade-in-delayed-2 mt-10 border px-10 py-4 text-sm font-semibold uppercase tracking-widest transition-colors duration-300 hover:opacity-80"
          style={{
            borderColor: accentColor,
            color: isDark ? 'white' : 'inherit',
          }}
        >
          Découvrir nos biens
        </a>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="luxury-animate-fade-in-delayed-3 mt-16 flex gap-12 md:gap-20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold md:text-4xl" style={{ color: accentColor }}>
                  <AnimatedCounter target={stat.value!} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-xs uppercase tracking-widest opacity-70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 luxury-animate-scroll-bounce">
          <ChevronDown className="h-8 w-8 opacity-50" />
        </div>
      </div>
    </section>
  );
}
