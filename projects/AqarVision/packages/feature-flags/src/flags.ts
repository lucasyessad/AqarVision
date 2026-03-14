export type FeatureFlag =
  | "ai_description_generation"
  | "ai_image_enhancement"
  | "ai_price_estimation"
  | "advanced_analytics"
  | "bulk_listing_import"
  | "custom_branding"
  | "lead_scoring"
  | "multi_branch"
  | "priority_support"
  | "virtual_tours"
  | "whatsapp_integration"
  | "api_access";

export interface FlagConfig {
  /** Whether the flag is enabled by default (free tier) */
  defaultEnabled: boolean;
  /** Human-readable description */
  description: string;
  /** Minimum plan required (null means available to all) */
  minimumPlan: "starter" | "pro" | "enterprise" | null;
}

export const DEFAULT_FLAGS: Record<FeatureFlag, FlagConfig> = {
  ai_description_generation: {
    defaultEnabled: false,
    description: "AI-powered listing description generation",
    minimumPlan: "pro",
  },
  ai_image_enhancement: {
    defaultEnabled: false,
    description: "AI-powered image enhancement and optimization",
    minimumPlan: "pro",
  },
  ai_price_estimation: {
    defaultEnabled: false,
    description: "AI-powered price estimation based on market data",
    minimumPlan: "enterprise",
  },
  advanced_analytics: {
    defaultEnabled: false,
    description: "Advanced analytics dashboard with detailed metrics",
    minimumPlan: "pro",
  },
  bulk_listing_import: {
    defaultEnabled: false,
    description: "Import listings in bulk via CSV or API",
    minimumPlan: "pro",
  },
  custom_branding: {
    defaultEnabled: false,
    description: "Custom agency branding on listing pages",
    minimumPlan: "pro",
  },
  lead_scoring: {
    defaultEnabled: false,
    description: "Automatic lead quality scoring",
    minimumPlan: "enterprise",
  },
  multi_branch: {
    defaultEnabled: false,
    description: "Support for multiple agency branches",
    minimumPlan: "enterprise",
  },
  priority_support: {
    defaultEnabled: false,
    description: "Priority customer support channel",
    minimumPlan: "enterprise",
  },
  virtual_tours: {
    defaultEnabled: false,
    description: "360-degree virtual property tours",
    minimumPlan: "pro",
  },
  whatsapp_integration: {
    defaultEnabled: false,
    description: "WhatsApp integration for lead communication",
    minimumPlan: "starter",
  },
  api_access: {
    defaultEnabled: false,
    description: "REST API access for third-party integrations",
    minimumPlan: "enterprise",
  },
};

/**
 * Check if a feature flag is enabled.
 * Uses the overrides map first, then falls back to default configuration.
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  overrides?: Partial<Record<FeatureFlag, boolean>>
): boolean {
  if (overrides && flag in overrides) {
    return overrides[flag] ?? DEFAULT_FLAGS[flag].defaultEnabled;
  }
  return DEFAULT_FLAGS[flag].defaultEnabled;
}

/**
 * Get all flags that are enabled for a given plan level.
 */
export function getFlagsForPlan(
  plan: "starter" | "pro" | "enterprise"
): FeatureFlag[] {
  const planHierarchy: Record<string, number> = {
    starter: 1,
    pro: 2,
    enterprise: 3,
  };

  const planLevel = planHierarchy[plan];

  return (Object.entries(DEFAULT_FLAGS) as [FeatureFlag, FlagConfig][])
    .filter(([, config]) => {
      if (config.minimumPlan === null) return true;
      return planHierarchy[config.minimumPlan] <= planLevel;
    })
    .map(([flag]) => flag);
}
