import type { Agency, Property } from '@/types/database';
import type { PropertiesVariant } from '@/lib/themes/registry';
import { PropertiesGrid } from './properties-grid';
import { PropertiesFeatured } from './properties-featured';
import { PropertiesEditorial } from './properties-editorial';
import { PropertiesPremium } from './properties-premium';

interface PropertiesSectionProps {
  variant: PropertiesVariant;
  agency: Agency;
  properties: Property[];
}

export function PropertiesSection({ variant, agency, properties }: PropertiesSectionProps) {
  switch (variant) {
    case 'properties-grid':
      return <PropertiesGrid agency={agency} properties={properties} />;
    case 'properties-featured':
      return <PropertiesFeatured agency={agency} properties={properties} />;
    case 'properties-editorial':
      return <PropertiesEditorial agency={agency} properties={properties} />;
    case 'properties-premium':
      return <PropertiesPremium agency={agency} properties={properties} />;
    default:
      return <PropertiesGrid agency={agency} properties={properties} />;
  }
}
