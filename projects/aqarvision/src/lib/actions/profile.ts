'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  wilaya: z.string().max(100).optional(),
  locale: z.enum(['fr', 'ar']).optional(),
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, user: null, error: 'Non authentifié' };
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return { profile: null, user, error: error.message };
  }

  return { profile, user, error: null };
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  wilaya?: string;
  locale?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Non authentifié' };
  }

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Données invalides' };
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, ...parsed.data, updated_at: new Date().toISOString() });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profil');
  return { error: null };
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { url: null, error: 'Non authentifié' };
  }

  const file = formData.get('avatar') as File | null;
  if (!file || file.size === 0) {
    return { url: null, error: 'Aucun fichier fourni' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `avatars/${user.id}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() });

  if (updateError) {
    return { url: null, error: updateError.message };
  }

  revalidatePath('/profil');
  return { url: publicUrl, error: null };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Non authentifié' };
  }

  // Sign out the user; actual account deletion requires contacting support
  await supabase.auth.signOut();

  return {
    error: null,
    message:
      'Vous avez été déconnecté. Pour supprimer définitivement votre compte, veuillez contacter notre support à support@aqarvision.dz',
  };
}

export async function changePassword(newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
