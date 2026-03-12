import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, MapPin, Users, Home, Calendar } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeroEditorialProps {
  agency: Agency;
}

/** Professional theme: hero éditorial texte + stats */
export function HeroEditorial({ agency }: HeroEditorialProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  const stats = [
    { value: agency.stats_years, label: t('about.years'), icon: Calendar },
    { value: agency.stats_properties_sold, label: t('about.sold'), icon: Home },
    { value: agency.stats_clients, label: t('about.clients'), icon: Users },
  ].filter((s) => s.value != null && s.value > 0);

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Text content */}
          <FadeIn>
            <div>
              {agency.logo_url && (
                <Image
                  src={agency.logo_url}
                  alt={agency.name}
                  width={56}
                  height={56}
                  className="mb-6 object-cover rounded-xl"
                  unoptimized
                />
              )}
              <h1 className="text-display-md font-vitrine text-foreground leading-tight">
                {agency.name}
              </h1>
              <div className="mt-4 h-1 w-12" style={{ backgroundColor: accentColor }} />
              {agency.slogan && (
                <p className="mt-5 text-body-lg text-muted-foreground max-w-md">{agency.slogan}</p>
              )}
              {agency.wilaya && (
                <p className="mt-3 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" style={{ color: accentColor }} />
                  {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
                </p>
              )}
              <FadeInUp delay={0.15}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/agence/${agency.slug}/biens`}
                    className="inline-flex items-center gap-2 h-11 px-6 text-white text-body-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: accentColor }}
                  >
                    {t('nav.properties')} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/agence/${agency.slug}/contact`}
                    className="inline-flex items-center gap-2 h-11 px-6 border border-neutral-200 text-foreground text-body-sm font-semibold rounded-lg transition-colors hover:bg-neutral-50"
                  >
                    <Phone className="h-4 w-4" /> {t('nav.contact')}
                  </Link>
                </div>
              </FadeInUp>
            </div>
          </FadeIn>

          {/* Right: Stats or cover image */}
          <FadeInUp delay={0.2}>
            <div>
              {agency.cover_image_url ? (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={agency.cover_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : stats.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl bg-neutral-50 p-6 text-center">
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
              ) : (
                <div className="aspect-[4/3] rounded-2xl bg-neutral-50 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
                    <Home className="h-8 w-8" style={{ color: accentColor }} />
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
