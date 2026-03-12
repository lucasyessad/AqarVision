import type { Agency } from '@/types/database';
import type { CtaVariant } from '@/lib/themes/registry';
import { CtaBanner } from './cta-banner';
import { CtaCard } from './cta-card';

interface CtaSectionProps {
  variant: CtaVariant;
  agency: Agency;
}

export function CtaSection({ variant, agency }: CtaSectionProps) {
  switch (variant) {
    case 'cta-banner':
      return <CtaBanner agency={agency} />;
    case 'cta-card':
      return <CtaCard agency={agency} />;
    default:
      return <CtaBanner agency={agency} />;
  }
}
