import type { Agency, Property } from '@/types/database';
import type { ThemeManifest, SectionId, SectionVariant, HeroVariant, PropertiesVariant, AboutVariant, CtaVariant } from '@/lib/themes/registry';
import { HeroSection } from './sections/hero';
import { PropertiesSection } from './sections/properties';
import { AboutSection } from './sections/about';
import { CtaSection } from './sections/cta';
import { SocialFeedSection } from './social-feed-section';
import type { SocialPost } from '@/types/database';
import type { OEmbedData } from '@/lib/social/fetch-feed';

export interface SocialFeedData {
  posts: SocialPost[];
  embeds: OEmbedData[];
  hasApiData: boolean;
}

interface ThemeRendererProps {
  agency: Agency;
  properties: Property[];
  manifest: ThemeManifest;
  socialFeed?: SocialFeedData;
}

/**
 * Theme Renderer — Renders agency home page sections
 * according to the theme manifest's section order and variants.
 */
export function ThemeRenderer({ agency, properties, manifest, socialFeed }: ThemeRendererProps) {
  const sortedSections = [...manifest.sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          sectionId={section.id}
          variant={section.variant}
          agency={agency}
          properties={properties}
          socialFeed={socialFeed}
        />
      ))}
    </>
  );
}

interface SectionRendererProps {
  sectionId: SectionId;
  variant: SectionVariant;
  agency: Agency;
  properties: Property[];
  socialFeed?: {
    posts: SocialPost[];
    embeds: OEmbedData[];
    hasApiData: boolean;
  };
}

function SectionRenderer({ sectionId, variant, agency, properties, socialFeed }: SectionRendererProps) {
  switch (sectionId) {
    case 'hero':
      return <HeroSection variant={variant as HeroVariant} agency={agency} />;
    case 'properties':
      return <PropertiesSection variant={variant as PropertiesVariant} agency={agency} properties={properties} />;
    case 'about':
      return <AboutSection variant={variant as AboutVariant} agency={agency} />;
    case 'cta':
      return <CtaSection variant={variant as CtaVariant} agency={agency} />;
    case 'social':
      if (!socialFeed) return null;
      return (
        <SocialFeedSection
          agency={agency}
          posts={socialFeed.posts}
          embeds={socialFeed.embeds}
          hasApiData={socialFeed.hasApiData}
        />
      );
    default:
      return null;
  }
}
