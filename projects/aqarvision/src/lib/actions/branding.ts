'use server';

import { createClient } from '@/lib/supabase/server';
import { agencyBrandingSchema, agencyLuxuryBrandingSchema } from '@/lib/validators';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Met à jour le branding d'une agence.
 * Détecte automatiquement le plan (Enterprise vs Starter/Pro)
 * et applique le schéma de validation approprié.
 */
export async function updateAgencyBranding(
  agencyId: string,
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();

  // Récupérer l'agence pour déterminer le plan
  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('active_plan')
    .eq('id', agencyId)
    .single();

  if (fetchError || !agency) {
    return { success: false, error: 'Agence introuvable' };
  }

  const isEnterprise = agency.active_plan === 'enterprise';
  const schema = isEnterprise ? agencyLuxuryBrandingSchema : agencyBrandingSchema;

  // Valider les données
  const result = schema.safeParse(formData);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  // Mettre à jour l'agence
  const { error: updateError } = await supabase
    .from('agencies')
    .update({
      ...result.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agencyId);

  if (updateError) {
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }

  return { success: true };
}

const MAX_COVER_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload une image de couverture pour une agence Enterprise.
 * Stockée dans agencies/{id}/branding/cover.{ext}
 */
export async function updateAgencyCoverImage(
  agencyId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  // Vérifier que l'agence est Enterprise
  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('active_plan')
    .eq('id', agencyId)
    .single();

  if (fetchError || !agency) {
    return { success: false, error: 'Agence introuvable' };
  }

  if (agency.active_plan !== 'enterprise') {
    return { success: false, error: 'Cette fonctionnalité est réservée au plan Enterprise' };
  }

  const file = formData.get('cover') as File | null;
  if (!file) {
    return { success: false, error: 'Aucun fichier sélectionné' };
  }

  if (file.size > MAX_COVER_SIZE) {
    return { success: false, error: 'Le fichier ne doit pas dépasser 10 Mo' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Format accepté : JPEG, PNG ou WebP' };
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `agencies/${agencyId}/branding/cover.${ext}`;

  // Upload vers Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: "Erreur lors de l'upload" };
  }

  // Obtenir l'URL publique
  const { data: urlData } = supabase.storage.from('public').getPublicUrl(path);

  // Mettre à jour cover_image_url
  const { error: updateError } = await supabase
    .from('agencies')
    .update({
      cover_image_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agencyId);

  if (updateError) {
    return { success: false, error: "Erreur lors de la mise à jour de l'URL" };
  }

  return { success: true };
}
