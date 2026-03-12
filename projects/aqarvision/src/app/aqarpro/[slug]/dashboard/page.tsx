import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Eye, TrendingUp, Plus, ArrowRight, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { getPlanConfig } from '@/config';
import { FadeInUp, StaggerContainer } from '@/components/ui/animated-sections';

/* ─── Lead status badge ──────────────────────────── */

function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'primary' | 'default' }> = {
    new:         { label: 'Nouveau',    variant: 'success' },
    contacted:   { label: 'Contacté',   variant: 'info'    },
    qualified:   { label: 'Qualifié',   variant: 'warning' },
    negotiation: { label: 'En cours',   variant: 'warning' },
    converted:   { label: 'Converti',   variant: 'primary' },
    lost:        { label: 'Perdu',      variant: 'default' },
  };
  const cfg = map[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function eventLabel(type: string, metadata: Record<string, unknown> | null): string {
  switch (type) {
    case 'new_lead':         return `Nouveau lead reçu${metadata?.property_title ? ` pour ${metadata.property_title}` : ''}`;
    case 'property_view':    return `Visite sur ${metadata?.property_title ?? 'un bien'}`;
    case 'property_created': return `Bien « ${metadata?.title ?? '—'} » publié`;
    case 'lead_converted':   return `Lead converti pour ${metadata?.property_title ?? 'un bien'}`;
    default:                 return type.replace(/_/g, ' ');
  }
}

/* ─── Page ───────────────────────────────────────── */

export default async function DashboardPage({
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
    .select('id, name, active_plan')
    .eq('owner_id', user.id)
    .single();

  if (!agency) redirect('/profil'); // particulier connecté sans agence

  const agencyId = agency.id;
  const now          = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonth    = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const [
    { count: activeProperties },
    { count: leadsThisMonth },
    { count: leadsLastMonth },
    { count: convertedThisMonth },
    { count: viewsThisMonth },
    { count: viewsLastMonth },
    { data: recentLeads },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'active'),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', firstOfMonth),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', lastMonth).lte('created_at', endLastMonth),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).eq('status', 'converted').gte('created_at', firstOfMonth),
    supabase.from('property_views').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', firstOfMonth),
    supabase.from('property_views').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', lastMonth).lte('created_at', endLastMonth),
    supabase.from('leads').select('id, name, status, created_at, property_id, properties(title)').eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(5),
    supabase.from('analytics_events').select('id, event_type, metadata, created_at').eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(8),
  ]);

  const leadsTrend = leadsLastMonth
    ? Math.round((((leadsThisMonth ?? 0) - (leadsLastMonth ?? 0)) / Math.max(leadsLastMonth ?? 1, 1)) * 100)
    : 0;

  const viewsTrend = viewsLastMonth
    ? Math.round((((viewsThisMonth ?? 0) - (viewsLastMonth ?? 0)) / Math.max(viewsLastMonth ?? 1, 1)) * 100)
    : 0;

  const conversionRate = leadsThisMonth
    ? Math.round(((convertedThisMonth ?? 0) / Math.max(leadsThisMonth ?? 1, 1)) * 100)
    : 0;

  const planConfig  = getPlanConfig(agency.active_plan ?? 'starter');
  const propLimit   = planConfig?.limits?.maxProperties ?? 15;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'vous';

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-heading-lg text-neutral-900">Bonjour, {firstName}</h1>
            <p className="text-body-sm text-neutral-500 mt-0.5">
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link
            href={`/aqarpro/${slug}/properties/new`}
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary-600 text-white text-body-sm font-semibold rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Ajouter un bien
          </Link>
        </div>
      </FadeInUp>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeInUp>
          <StatCard
            label="Biens actifs"
            value={`${activeProperties ?? 0} / ${propLimit}`}
            icon={Home}
          />
        </FadeInUp>
        <FadeInUp>
          <StatCard
            label="Vues ce mois"
            value={(viewsThisMonth ?? 0).toLocaleString('fr-FR')}
            icon={Eye}
            trend={{ value: viewsTrend, label: 'vs mois dernier' }}
          />
        </FadeInUp>
        <FadeInUp>
          <StatCard
            label="Leads ce mois"
            value={leadsThisMonth ?? 0}
            icon={Users}
            trend={{ value: leadsTrend, label: 'vs mois dernier' }}
          />
        </FadeInUp>
        <FadeInUp>
          <StatCard
            label="Taux de conversion"
            value={`${conversionRate}%`}
            icon={TrendingUp}
          />
        </FadeInUp>
      </StaggerContainer>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leads */}
        <FadeInUp>
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
            <h2 className="text-heading-sm text-neutral-900">Derniers leads</h2>
            <Link href={`/aqarpro/${slug}/leads`} className="flex items-center gap-1 text-body-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentLeads && recentLeads.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {recentLeads.map((lead: any) => (
                <Link key={lead.id} href={`/aqarpro/${slug}/leads/${lead.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-neutral-900 truncate">{lead.name}</p>
                    <p className="text-caption text-neutral-500 truncate">{(lead.properties as any)?.title ?? 'Bien non spécifié'}</p>
                  </div>
                  <p className="text-caption text-neutral-400 shrink-0">{formatDate(lead.created_at)}</p>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-body-md text-neutral-400">Aucun lead pour l&apos;instant</div>
          )}
        </div>
        </FadeInUp>

        {/* Activity feed */}
        <FadeInUp>
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-heading-sm text-neutral-900">Activité récente</h2>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="px-6 py-4 flex flex-col gap-4">
              {recentActivity.map((event: any) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-neutral-700">{eventLabel(event.event_type, event.metadata)}</p>
                    <p className="text-caption text-neutral-400 mt-0.5">{formatDate(event.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-body-md text-neutral-400">Aucune activité</div>
          )}
        </div>
        </FadeInUp>
      </div>
    </div>
  );
}
