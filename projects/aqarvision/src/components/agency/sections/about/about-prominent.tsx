import Link from 'next/link';
import { ArrowRight, Calendar, Home, Users } from 'lucide-react';
import { FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface AboutProminentProps {
  agency: Agency;
}

/** Prominent about section with stats */
export function AboutProminent({ agency }: AboutProminentProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  const stats = [
    { value: agency.stats_years, label: t('about.years'), icon: Calendar },
    { value: agency.stats_properties_sold, label: t('about.sold'), icon: Home },
    { value: agency.stats_clients, label: t('about.clients'), icon: Users },
  ].filter((s) => s.value != null && s.value > 0);

  return (
    <section className="bg-white border-t border-neutral-100">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <FadeInUp>
          <div className="text-center mb-12">
            <h2 className="text-heading-lg text-foreground font-vitrine">
              {t('about.heading', { name: agency.name })}
            </h2>
            <div className="mx-auto mt-4 h-0.5 w-12" style={{ backgroundColor: accentColor }} />
          </div>
        </FadeInUp>

        {agency.description && (
          <FadeInUp>
            <p className="mx-auto max-w-2xl text-center text-body-sm text-neutral-600 leading-relaxed">
              {agency.description}
            </p>
          </FadeInUp>
        )}

        {stats.length > 0 && (
          <FadeInUp>
            <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center p-6 rounded-xl bg-neutral-50">
                    <Icon className="mx-auto mb-3 h-5 w-5" style={{ color: accentColor }} />
                    <div className="text-display-sm font-bold" style={{ color: accentColor }}>
                      {stat.value}+
                    </div>
                    <div className="mt-1 text-caption text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeInUp>
        )}

        <FadeInUp>
          <div className="mt-10 text-center">
            <Link
              href={`/agence/${agency.slug}/a-propos`}
              className="inline-flex items-center gap-1.5 text-body-sm font-medium transition-colors"
              style={{ color: accentColor }}
            >
              {t('about.readMore')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
