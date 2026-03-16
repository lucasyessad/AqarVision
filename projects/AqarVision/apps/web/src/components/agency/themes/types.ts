import type { AgencyPublicDto } from "@/features/marketplace/types/search.types";
import type { SearchResultDto } from "@/features/marketplace/types/search.types";

/**
 * Props shared by ALL agency theme components.
 * Each theme renders a complete vitrine page with these data.
 */
export interface AgencyThemeProps {
  agency: AgencyPublicDto;
  listings: SearchResultDto[];
  locale: string;
}
