'use client';

import { Building2, FileText, MapPin } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { Agency } from '@/types/database';

interface LuxuryAboutSectionProps {
  agency: Agency;
  showStats?: boolean;
}

export function LuxuryAboutSection({ agency, showStats = true }: LuxuryAboutSectionProps) {
  const containerRef = useScrollReveal();
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;

  const stats = [
    { value: agency.stats_years, label: "Années d'expérience" },
    { value: agency.stats_properties_sold, label: 'Biens vendus' },
    { value: agency.stats_clients, label: 'Clients satisfaits' },
  ].filter((s) => s.value != null && s.value > 0);

  const infoCards = [
    { icon: MapPin, label: 'Wilaya', value: agency.wilaya },
    { icon: FileText, label: 'Registre de commerce', value: agency.registre_commerce },
    { icon: Building2, label: 'Adresse', value: agency.address },
  ].filter((c) => c.value);

  return (
    <section
      ref={containerRef}
      className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* En-tête */}
        <div className="luxury-scroll-reveal mb-16 text-center">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            Notre histoire
          </span>
          <h2
            className={`mt-4 font-display-classic text-display-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            À propos de {agency.name}
          </h2>
          <div
            className="luxury-animate-line-grow mx-auto mt-6 h-0.5"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Description */}
        {agency.description && (
          <p
            className={`luxury-scroll-reveal mx-auto max-w-2xl text-center text-lg leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {agency.description}
          </p>
        )}

        {/* Statistiques */}
        {showStats && stats.length > 0 && (
          <div className="luxury-scroll-reveal mt-16 grid gap-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-4xl font-bold"
                  style={{ color: accentColor }}
                >
                  {stat.value}+
                </div>
                <div
                  className={`mt-2 text-sm uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info cards */}
        {infoCards.length > 0 && (
          <div className="luxury-scroll-reveal mt-16 grid gap-6 sm:grid-cols-3">
            {infoCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`rounded-lg p-6 text-center ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}
                >
                  <Icon
                    className="mx-auto mb-3 h-6 w-6"
                    style={{ color: accentColor }}
                  />
                  <div
                    className={`text-xs uppercase tracking-wider ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {card.label}
                  </div>
                  <div
                    className={`mt-2 font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {card.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
