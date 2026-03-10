'use server';

import { createClient } from '@/lib/supabase/server';
import { propertySchema } from '@/lib/validators/property';
import { createPlanGate } from '@/lib/plan-gate';
import { revalidatePath } from 'next/cache';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function createProperty(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const result = propertySchema.safeParse(formData);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  const supabase = await createClient();

  // Vérifier les limites du plan
  const { count: currentCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', auth.agency.id)
    .in('status', ['active', 'draft']);

  const gate = createPlanGate(auth.agency.active_plan);
  if (!gate.canPublishProperty(currentCount || 0)) {
    return {
      success: false,
      error: `Limite de ${gate.limits.maxProperties} biens atteinte pour votre plan. Passez au plan supérieur.`,
    };
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({
      ...result.data,
      agency_id: auth.agency.id,
      created_by: auth.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: 'Erreur lors de la création du bien' };
  }

  revalidatePath('/dashboard/properties');
  return { success: true, id: data.id };
}

export async function updateProperty(
  propertyId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const result = propertySchema.safeParse(formData);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .update({
      ...result.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath('/dashboard/properties');
  return { success: true };
}

export async function deleteProperty(propertyId: string): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  revalidatePath('/dashboard/properties');
  return { success: true };
}
