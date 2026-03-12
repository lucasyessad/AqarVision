import type { Agency } from '@/types/database';
import type { AboutVariant } from '@/lib/themes/registry';
import { AboutSimple } from './about-simple';
import { AboutProminent } from './about-prominent';
import { AboutLuxury } from './about-luxury';

interface AboutSectionProps {
  variant: AboutVariant;
  agency: Agency;
}

export function AboutSection({ variant, agency }: AboutSectionProps) {
  switch (variant) {
    case 'about-simple':
      return <AboutSimple agency={agency} />;
    case 'about-prominent':
      return <AboutProminent agency={agency} />;
    case 'about-luxury':
      return <AboutLuxury agency={agency} />;
    default:
      return <AboutSimple agency={agency} />;
  }
}
