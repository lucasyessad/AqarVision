import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { List, Kanban } from 'lucide-react';
import { LeadsKanban, type KanbanLead } from '@/components/dashboard/leads-kanban';

export const metadata = {
  title: 'Leads — Vue Kanban',
};

export default async function LeadsKanbanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, active_plan')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return (
      <div className="p-8">
        <p className="text-red-600">Agence introuvable.</p>
      </div>
    );
  }

  const { data: leadsRaw } = await supabase
    .from('leads')
    .select('id, name, phone, email, status, priority, score, properties:property_id(title)')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  const leads: KanbanLead[] = (leadsRaw ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email ?? null,
    status: l.status as KanbanLead['status'],
    priority: l.priority,
    score: (l as { score?: number }).score ?? null,
    property_title: (l.properties as { title: string } | null)?.title ?? null,
  }));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            {leads.length} lead(s) au total
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600
              transition hover:bg-white hover:shadow-sm"
          >
            <List className="h-4 w-4" />
            Liste
          </Link>
          <span
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm"
          >
            <Kanban className="h-4 w-4" />
            Kanban
          </span>
        </div>
      </div>

      {leads.length > 0 ? (
        <LeadsKanban initialLeads={leads} />
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">Aucun lead pour le moment</p>
          <p className="mt-2 text-sm text-gray-400">
            Les leads apparaîtront ici quand des visiteurs vous contacteront via votre mini-site.
          </p>
        </div>
      )}
    </div>
  );
}
