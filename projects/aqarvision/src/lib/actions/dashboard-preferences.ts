'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { proPattern } from '@/lib/utils/paths';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';
import { dashboardPreferencesSchema } from '@/lib/validators/dashboard-preferences';

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function saveDashboardPreferences(data: {
  widget_order: string[];
  hidden_widgets: string[];
}): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const result = dashboardPreferencesSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('agency_dashboard_preferences')
    .upsert({
      agency_id: auth.agency.id,
      widget_order: result.data.widget_order,
      hidden_widgets: result.data.hidden_widgets,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'agency_id' });

  if (error) {
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }

  revalidatePath(proPattern('dashboard'));
  return { success: true };
}

export async function resetDashboardPreferences(): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  await supabase
    .from('agency_dashboard_preferences')
    .delete()
    .eq('agency_id', auth.agency.id);

  revalidatePath(proPattern('dashboard'));
  return { success: true };
}
