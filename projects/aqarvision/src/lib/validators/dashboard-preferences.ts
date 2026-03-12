import { z } from 'zod';

const VALID_WIDGETS = ['stats', 'recent_leads', 'activity', 'visit_requests'] as const;

export const dashboardPreferencesSchema = z.object({
  widget_order: z.array(z.enum(VALID_WIDGETS)).min(1),
  hidden_widgets: z.array(z.enum(VALID_WIDGETS)),
});

export type DashboardPreferencesInput = z.infer<typeof dashboardPreferencesSchema>;
