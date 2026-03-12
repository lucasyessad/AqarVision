import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone, MapPin } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import { getTranslations } from '@/lib/i18n';
import type { Agency } from '@/types/database';

interface HeroMediumProps {
  agency: Agency;
}

/** Modern theme: hero moyen avec image + CTA */
export function HeroMedium({ agency }: HeroMediumProps) {
  const t = getTranslations(agency.locale ?? 'fr');
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
      {agency.cover_image_url ? (
        <div className="absolute inset-0">
          <Image
            src={agency.cover_image_url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ) : (
        <div className="absolute inset-0 hero-gradient">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        </div>
      )}

      <FadeIn>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 text-center">
          {agency.logo_url && (
            <Image
              src={agency.logo_url}
              alt={agency.name}
              width={72}
              height={72}
              className="mx-auto mb-6 object-cover border-2 border-white/20 shadow-lg rounded-2xl"
              unoptimized
            />
          )}
          <h1 className="text-display-md sm:text-display-lg font-vitrine text-white">
            {agency.name}
          </h1>
          <div className="mx-auto mt-4 h-0.5 w-16" style={{ backgroundColor: accentColor }} />
          {agency.slogan && (
            <p className="mt-4 text-body-lg text-white/75 max-w-xl mx-auto">{agency.slogan}</p>
          )}
          {agency.wilaya && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              {agency.wilaya}{agency.address ? ` — ${agency.address}` : ''}
            </p>
          )}
          <FadeInUp delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/agence/${agency.slug}/biens`}
                className="inline-flex items-center gap-2 h-11 px-6 bg-white text-foreground text-body-sm font-semibold rounded-lg transition-all hover:bg-neutral-100 hover:shadow-lg"
              >
                {t('nav.properties')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/agence/${agency.slug}/contact`}
                className="inline-flex items-center gap-2 h-11 px-6 border border-white/30 text-white text-body-sm font-semibold rounded-lg transition-all hover:bg-white/10"
              >
                <Phone className="h-4 w-4" /> {t('nav.contact')}
              </Link>
            </div>
          </FadeInUp>
        </div>
      </FadeIn>
    </section>
  );
}
