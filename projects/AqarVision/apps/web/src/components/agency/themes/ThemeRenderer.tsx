import dynamic from "next/dynamic";
import type { StorefrontProps } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const themeComponents: Record<string, React.ComponentType<any>> = {
  "luxe-noir": dynamic(() => import("./LuxeNoir")),
  "mediterranee": dynamic(() => import("./Mediterranee")),
  "neo-brutalist": dynamic(() => import("./NeoBrutalist")),
  "mediterraneen-contemporain": dynamic(() => import("./MediterraneenContemporain")),
  "pastel-doux": dynamic(() => import("./PastelDoux")),
  "corporate-navy": dynamic(() => import("./CorporateNavy")),
  "editorial": dynamic(() => import("./Editorial")),
  "art-deco": dynamic(() => import("./ArtDeco")),
  "organique-eco": dynamic(() => import("./OrganiqueEco")),
  "swiss-minimal": dynamic(() => import("./SwissMinimal")),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const DEFAULT_THEME = "mediterranee";

interface ThemeRendererProps extends StorefrontProps {
  themeId: string;
}

export default function ThemeRenderer({ themeId, ...props }: ThemeRendererProps) {
  const ThemeComponent = themeComponents[themeId] ?? themeComponents[DEFAULT_THEME]!;

  return <ThemeComponent {...props} />;
}
