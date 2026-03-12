import type { Agency } from '@/types/database';
import type { HeroVariant } from '@/lib/themes/registry';
import { HeroShort } from './hero-short';
import { HeroMedium } from './hero-medium';
import { HeroEditorial } from './hero-editorial';
import { HeroFullwidth } from './hero-fullwidth';
import { HeroOverlay } from './hero-overlay';
import { HeroFullscreen } from './hero-fullscreen';
import { HeroAsymmetric } from './hero-asymmetric';

interface HeroSectionProps {
  variant: HeroVariant;
  agency: Agency;
}

export function HeroSection({ variant, agency }: HeroSectionProps) {
  switch (variant) {
    case 'hero-short':
      return <HeroShort agency={agency} />;
    case 'hero-medium':
      return <HeroMedium agency={agency} />;
    case 'hero-editorial':
      return <HeroEditorial agency={agency} />;
    case 'hero-fullwidth':
      return <HeroFullwidth agency={agency} />;
    case 'hero-overlay':
      return <HeroOverlay agency={agency} />;
    case 'hero-fullscreen':
      return <HeroFullscreen agency={agency} />;
    case 'hero-asymmetric':
      return <HeroAsymmetric agency={agency} />;
    default:
      return <HeroMedium agency={agency} />;
  }
}
