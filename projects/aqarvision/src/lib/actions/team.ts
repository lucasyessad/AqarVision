'use server';

import { createClient } from '@/lib/supabase/server';
import { createPlanGate } from '@/lib/plan-gate';
import { revalidatePath } from 'next/cache';
import { proPattern } from '@/lib/utils/paths';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';
import { inviteMemberSchema } from '@/lib/validators/team';

interface ActionResult {
  success: boolean;
  error?: string;
}

const VALID_ROLES = ['admin', 'agent', 'viewer'] as const; // kept for updateMemberRole

export async function inviteMember(
  email: string,
  role: string,
  fullName: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const validated = inviteMemberSchema.safeParse({ email, role, fullName });
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message || 'Données invalides' };
  }

  const supabase = await createClient();

  // Vérifier les limites du plan
  const { count: currentCount } = await supabase
    .from('agency_members')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', auth.agency.id)
    .eq('is_active', true);

  const gate = createPlanGate(auth.agency.active_plan);
  if (!gate.canAddMember((currentCount || 0) + 1)) { // +1 pour le owner
    return {
      success: false,
      error: `Limite de ${gate.limits.maxMembers} membres atteinte pour votre plan.`,
    };
  }

  // Vérifier que le membre n'existe pas déjà
  const { data: existing } = await supabase
    .from('agency_members')
    .select('id, is_active')
    .eq('agency_id', auth.agency.id)
    .eq('email', email)
    .single();

  if (existing) {
    if (existing.is_active) {
      return { success: false, error: 'Ce membre fait déjà partie de l\'équipe.' };
    }
    // Réactiver le membre
    const { error } = await supabase
      .from('agency_members')
      .update({
        is_active: true,
        role,
        full_name: fullName,
        invited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) return { success: false, error: 'Erreur lors de la réactivation' };

    revalidatePath(proPattern('settings/team'));
    return { success: true };
  }

  const { error } = await supabase.from('agency_members').insert({
    agency_id: auth.agency.id,
    user_id: auth.user.id, // Placeholder - sera mis à jour quand le membre acceptera
    email,
    full_name: fullName,
    role,
    is_active: true,
    invited_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, error: 'Erreur lors de l\'invitation' };
  }

  revalidatePath(proPattern('settings/team'));
  return { success: true };
}

export async function updateMemberRole(
  memberId: string,
  role: string
): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    return { success: false, error: 'Rôle invalide' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('agency_members')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  revalidatePath(proPattern('settings/team'));
  return { success: true };
}

export async function removeMember(memberId: string): Promise<ActionResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return auth;

  const supabase = await createClient();

  const { error } = await supabase
    .from('agency_members')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('agency_id', auth.agency.id);

  if (error) {
    return { success: false, error: 'Erreur lors de la suppression' };
  }

  revalidatePath(proPattern('settings/team'));
  return { success: true };
}
