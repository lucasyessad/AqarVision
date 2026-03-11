'use server';

import { createClient } from '@/lib/supabase/server';
import { getAgencyForCurrentUser } from './auth';
import { isAuthError } from './auth-utils';

export interface LeadExportRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  priority: string;
  source: string;
  property_title: string | null;
  created_at: string;
}

interface ExportResult {
  data?: LeadExportRow[];
  error?: string;
}

export async function getLeadsForExport(agencyId: string): Promise<ExportResult> {
  const auth = await getAgencyForCurrentUser();
  if (isAuthError(auth)) return { error: auth.error };

  // Ensure the requesting user owns this agency
  if (auth.agency.id !== agencyId) {
    return { error: 'Accès non autorisé' };
  }

  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, name, phone, email, message, status, priority, source, created_at, properties:property_id(title)')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (error) return { error: 'Erreur lors de la récupération des leads' };

  const rows: LeadExportRow[] = (leads ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email ?? null,
    message: l.message ?? null,
    status: l.status,
    priority: l.priority,
    source: l.source,
    property_title: (l.properties as { title: string } | null)?.title ?? null,
    created_at: l.created_at,
  }));

  return { data: rows };
}
