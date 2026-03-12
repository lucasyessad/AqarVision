import type { Agency } from '@/types/database';
import type { HeaderVariant, FooterVariant } from '@/lib/themes/registry';
import { HeaderStandard } from './header-standard';
import { HeaderMinimal } from './header-minimal';
import { HeaderLuxury } from './header-luxury';
import { FooterStandard } from './footer-standard';
import { FooterLuxury } from './footer-luxury';

interface HeaderSectionProps {
  variant: HeaderVariant;
  agency: Agency;
}

export function HeaderSection({ variant, agency }: HeaderSectionProps) {
  switch (variant) {
    case 'header-standard':
      return <HeaderStandard agency={agency} />;
    case 'header-minimal':
      return <HeaderMinimal agency={agency} />;
    case 'header-luxury':
      return <HeaderLuxury agency={agency} />;
    default:
      return <HeaderStandard agency={agency} />;
  }
}

interface FooterSectionProps {
  variant: FooterVariant;
  agency: Agency;
}

export function FooterSection({ variant, agency }: FooterSectionProps) {
  switch (variant) {
    case 'footer-standard':
      return <FooterStandard agency={agency} />;
    case 'footer-luxury':
      return <FooterLuxury agency={agency} />;
    default:
      return <FooterStandard agency={agency} />;
  }
}
