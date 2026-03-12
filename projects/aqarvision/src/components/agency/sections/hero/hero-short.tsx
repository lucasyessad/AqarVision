import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { FadeIn, FadeInUp } from '@/components/ui/animated-sections';
import type { Agency } from '@/types/database';

interface HeroShortProps {
  agency: Agency;
}

/** Minimal theme: hero court avec barre de recherche */
export function HeroShort({ agency }: HeroShortProps) {
  const accentColor = agency.accent_color || agency.primary_color;

  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-100" style={{ minHeight: '280px' }}>
      <FadeIn>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-4 mb-6">
            {agency.logo_url && (
              <Image
                src={agency.logo_url}
                alt={agency.name}
                width={48}
                height={48}
                className="object-cover"
                style={{ borderRadius: '2px' }}
                unoptimized
              />
            )}
            <div>
              <h1 className="text-heading-lg text-foreground tracking-tight">{agency.name}</h1>
              {agency.wilaya && (
                <p className="flex items-center gap-1 text-caption text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" /> {agency.wilaya}
                </p>
              )}
            </div>
          </div>

          {agency.slogan && (
            <p className="text-body-sm text-muted-foreground max-w-lg">{agency.slogan}</p>
          )}

          <FadeInUp delay={0.15}>
            <div className="mt-6 flex gap-3">
              <Link
                href={`/agence/${agency.slug}/biens`}
                className="inline-flex items-center gap-2 h-10 px-5 bg-foreground text-white text-body-sm font-medium transition-opacity hover:opacity-90"
              >
                Voir les biens <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/agence/${agency.slug}/contact`}
                className="inline-flex items-center gap-2 h-10 px-5 border border-neutral-200 text-foreground text-body-sm font-medium transition-colors hover:bg-neutral-50"
              >
                Contact
              </Link>
            </div>
          </FadeInUp>
        </div>
      </FadeIn>
    </section>
  );
}
