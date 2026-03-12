import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CalendarCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { VisitRequestRow } from './visit-request-row';

export const metadata = {
  title: 'Demandes de visite — AqarVision',
};

export default async function VisitRequestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return <p className="text-error-600">Agence introuvable.</p>;
  }

  const { data: requests } = await supabase
    .from('visit_requests')
    .select('*, properties:property_id(title)')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false });

  const total = requests?.length ?? 0;
  const pendingCount = requests?.filter((r) => r.status === 'pending').length ?? 0;
  const confirmedCount = requests?.filter((r) => r.status === 'confirmed').length ?? 0;
  const declinedCount = requests?.filter((r) => r.status === 'declined').length ?? 0;
  const completedCount = requests?.filter((r) => r.status === 'completed').length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-heading-lg text-neutral-900">Demandes de visite</h1>
        <p className="text-body-sm text-neutral-500 mt-0.5">
          {total} demande(s) au total · {pendingCount} en attente · {confirmedCount} confirmée(s)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En attente', value: pendingCount, icon: Clock, bg: 'bg-amber-100', text: 'text-amber-600' },
          { label: 'Confirmées', value: confirmedCount, icon: CheckCircle, bg: 'bg-success-100', text: 'text-success-600' },
          { label: 'Refusées', value: declinedCount, icon: XCircle, bg: 'bg-error-100', text: 'text-error-600' },
          { label: 'Effectuées', value: completedCount, icon: CalendarCheck, bg: 'bg-info-100', text: 'text-info-600' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 p-4">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.text}`} />
            </div>
            <div>
              <p className="text-caption text-neutral-500">{stat.label}</p>
              <p className="text-heading-md text-neutral-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {requests && requests.length > 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-6 py-3 font-medium text-neutral-500">Contact</th>
                <th className="px-6 py-3 font-medium text-neutral-500">Bien associé</th>
                <th className="px-6 py-3 font-medium text-neutral-500">Statut</th>
                <th className="px-6 py-3 font-medium text-neutral-500">Date</th>
                <th className="px-6 py-3 font-medium text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {requests.map((req) => (
                <VisitRequestRow
                  key={req.id}
                  request={{
                    id: req.id,
                    name: req.name,
                    phone: req.phone,
                    email: req.email,
                    message: req.message,
                    status: req.status,
                    propertyTitle: (req.properties as { title: string } | null)?.title || null,
                    createdAt: req.created_at,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
          <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <CalendarCheck className="h-6 w-6 text-neutral-400" />
          </div>
          <p className="text-body-md text-neutral-500">Aucune demande de visite</p>
          <p className="mt-2 text-body-sm text-neutral-400">
            Les demandes apparaîtront ici quand des visiteurs demanderont une visite via AqarSearch
          </p>
        </div>
      )}
    </div>
  );
}
