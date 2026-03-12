import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeroFullwidthProps {
  agency: Agency;
}

/** Editorial theme: hero pleine largeur image */
export function HeroFullwidth({ agency }: HeroFullwidthProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '560px' }}>
      {agency.cover_image_url ? (
        <div className="absolute inset-0">
          <Image
            src={agency.cover_image_url}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: agency.primary_color }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <FadeIn>
        <div className="relative mx-auto max-w-7xl px-6 flex flex-col justify-end" style={{ minHeight: '560px', paddingBottom: '4rem' }}>
          <div className="max-w-2xl">
            {agency.logo_url && (
              <Image
                src={agency.logo_url}
                alt={agency.name}
                width={56}
                height={56}
                className="mb-5 object-cover rounded-xl border border-white/20"
                unoptimized
              />
            )}
            <h1 className="text-display-lg font-vitrine text-white leading-tight">
              {agency.name}
            </h1>
            {agency.slogan && (
              <p className="mt-3 text-body-lg text-white/70 max-w-lg">{agency.slogan}</p>
            )}
            {agency.wilaya && (
              <p className="mt-3 flex items-center gap-1.5 text-body-sm text-white/50">
                <MapPin className="h-3.5 w-3.5" />
                {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
              </p>
            )}
            <FadeInUp delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/agence/${agency.slug}/biens`}
                  className="inline-flex items-center gap-2 h-11 px-6 bg-white text-foreground text-body-sm font-semibold rounded-lg transition-all hover:bg-neutral-100"
                >
                  {t('nav.properties')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/agence/${agency.slug}/contact`}
                  className="inline-flex items-center gap-2 h-11 px-6 border border-white/30 text-white text-body-sm font-semibold rounded-lg transition-all hover:bg-white/10"
                >
                  {t('nav.contact')}
                </Link>
              </div>
            </FadeInUp>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
