'use server';

import { createClient } from '@/lib/supabase/server';
import { agencyBrandingSchema, agencyLuxuryBrandingSchema, agencyWilayasSchema } from '@/lib/validators';
import { validateThemeForPlan } from '@/lib/validators/theme';
import type { AgencyWilayaInput } from '@/lib/validators';
import type { AgencyPlan } from '@/types/database';
import { UPLOADS, PLANS, STORAGE } from '@/config';

interface ActionResult {
  success: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Vérifie que l'utilisateur est authentifié et propriétaire de l'agence.
 * Retourne l'agence si autorisé, ou un ActionResult d'erreur.
 */
async function verifyAgencyOwnership(
  agencyId: string
): Promise<{ agency: { active_plan: string }; error?: never } | { agency?: never; error: ActionResult }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: { success: false, error: 'Vous devez être connecté' } };
  }

  const { data: agency, error: fetchError } = await supabase
    .from('agencies')
    .select('active_plan, owner_id')
    .eq('id', agencyId)
    .single();

  if (fetchError || !agency) {
    return { error: { success: false, error: 'Agence introuvable' } };
  }

  // Vérifier que l'utilisateur est propriétaire ou admin de l'agence
  if (agency.owner_id !== user.id) {
    const { data: member } = await supabase
      .from('agency_members')
      .select('role')
      .eq('agency_id', agencyId)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!member) {
      return { error: { success: false, error: 'Accès non autorisé' } };
    }
  }

  return { agency: { active_plan: agency.active_plan } };
}

/**
 * Valide et normalise l'extension d'un fichier uploadé.
 * Retourne uniquement les extensions autorisées.
 */
function getSafeExtension(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !UPLOADS.ALLOWED_EXTENSIONS.includes(ext)) return null;
  return ext;
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
  const auth = await verifyAgencyOwnership(agencyId);
  if (auth.error) return auth.error;

  const plan = (auth.agency.active_plan || 'starter') as AgencyPlan;
  const isEnterprise = plan === 'enterprise';
  const schema = isEnterprise ? agencyLuxuryBrandingSchema : agencyBrandingSchema;

  // Validate theme is available for the agency's plan
  const themeValue = formData.theme as string | undefined;
  if (themeValue) {
    const themeCheck = validateThemeForPlan(themeValue, plan);
    if (!themeCheck.valid) {
      return { success: false, error: themeCheck.error || 'Thème non disponible' };
    }
  }

  // Valider les données
  const result = schema.safeParse(formData);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  const supabase = await createClient();

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

/**
 * Upload une image de couverture pour une agence Enterprise.
 * Stockée dans agencies/{id}/branding/cover.{ext}
 */
export async function updateAgencyCoverImage(
  agencyId: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAgencyOwnership(agencyId);
  if (auth.error) return auth.error;

  if (auth.agency.active_plan !== 'enterprise') {
    return { success: false, error: 'Cette fonctionnalité est réservée au plan Enterprise' };
  }

  const file = formData.get('cover') as File | null;
  if (!file) {
    return { success: false, error: 'Aucun fichier sélectionné' };
  }

  if (file.size > UPLOADS.MAX_COVER_SIZE) {
    return { success: false, error: `Le fichier ne doit pas dépasser ${UPLOADS.MAX_COVER_SIZE / (1024 * 1024)} Mo` };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Format accepté : JPEG, PNG ou WebP' };
  }

  const ext = getSafeExtension(file.name);
  if (!ext) {
    return { success: false, error: 'Extension de fichier non autorisée' };
  }

  const path = STORAGE.coverPath(agencyId, ext);
  const supabase = await createClient();

  // Nettoyer les anciens fichiers cover (éviter les orphelins si extension change)
  const { data: existingFiles } = await supabase.storage
    .from('public')
    .list(STORAGE.brandingDir(agencyId));

  if (existingFiles) {
    const oldCovers = existingFiles
      .filter((f) => f.name.startsWith('cover.') && f.name !== `cover.${ext}`)
      .map((f) => `${STORAGE.brandingDir(agencyId)}/${f.name}`);
    if (oldCovers.length > 0) {
      await supabase.storage.from('public').remove(oldCovers);
    }
  }

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

/**
 * Upload un logo pour une agence.
 * Stocké dans agencies/{id}/branding/logo.{ext}
 */
export async function updateAgencyLogo(
  agencyId: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await verifyAgencyOwnership(agencyId);
  if (auth.error) return auth.error;

  const file = formData.get('logo') as File | null;
  if (!file) {
    return { success: false, error: 'Aucun fichier sélectionné' };
  }

  if (file.size > UPLOADS.MAX_LOGO_SIZE) {
    return { success: false, error: `Le fichier ne doit pas dépasser ${UPLOADS.MAX_LOGO_SIZE / (1024 * 1024)} Mo` };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: 'Format accepté : JPEG, PNG ou WebP' };
  }

  const ext = getSafeExtension(file.name);
  if (!ext) {
    return { success: false, error: 'Extension de fichier non autorisée' };
  }

  const path = STORAGE.logoPath(agencyId, ext);
  const supabase = await createClient();

  // Nettoyer les anciens fichiers logo
  const { data: existingFiles } = await supabase.storage
    .from('public')
    .list(STORAGE.brandingDir(agencyId));

  if (existingFiles) {
    const oldLogos = existingFiles
      .filter((f) => f.name.startsWith('logo.') && f.name !== `logo.${ext}`)
      .map((f) => `${STORAGE.brandingDir(agencyId)}/${f.name}`);
    if (oldLogos.length > 0) {
      await supabase.storage.from('public').remove(oldLogos);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { success: false, error: "Erreur lors de l'upload" };
  }

  const { data: urlData } = supabase.storage.from('public').getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('agencies')
    .update({
      logo_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agencyId);

  if (updateError) {
    return { success: false, error: "Erreur lors de la mise à jour de l'URL" };
  }

  return { success: true };
}

/**
 * Met à jour les wilayas d'une agence (multi-wilayas).
 * Supprime les anciennes et insère les nouvelles en une transaction.
 */
export async function updateAgencyWilayas(
  agencyId: string,
  wilayas: AgencyWilayaInput[]
): Promise<ActionResult> {
  const auth = await verifyAgencyOwnership(agencyId);
  if (auth.error) return auth.error;

  const result = agencyWilayasSchema.safeParse(wilayas);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: firstError?.message || 'Données invalides' };
  }

  const supabase = await createClient();

  // Supprimer les anciennes wilayas
  const { error: deleteError } = await supabase
    .from('agency_wilayas')
    .delete()
    .eq('agency_id', agencyId);

  if (deleteError) {
    return { success: false, error: 'Erreur lors de la suppression des wilayas' };
  }

  // Insérer les nouvelles
  const rows = result.data.map((w) => ({
    agency_id: agencyId,
    wilaya: w.wilaya,
    address: w.address || null,
    is_headquarters: w.is_headquarters,
  }));

  const { error: insertError } = await supabase
    .from('agency_wilayas')
    .insert(rows);

  if (insertError) {
    return { success: false, error: "Erreur lors de l'ajout des wilayas" };
  }

  // Mettre à jour la wilaya principale sur la table agencies (rétrocompatibilité)
  const hq = result.data.find((w) => w.is_headquarters) || result.data[0];
  if (hq) {
    await supabase
      .from('agencies')
      .update({ wilaya: hq.wilaya, updated_at: new Date().toISOString() })
      .eq('id', agencyId);
  }

  return { success: true };
}
