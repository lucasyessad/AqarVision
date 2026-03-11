import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getActiveSubscription, getSubscriptionHistory } from '@/lib/queries/subscription';
import { getPlanConfig, PLAN_CONFIGS, getPlanPrice } from '@/config';
import Link from 'next/link';
import { SubscribeForm } from './subscribe-form';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trial: { label: 'Essai gratuit', color: 'bg-blue-100 text-blue-700' },
  active: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  past_due: { label: 'Impayé', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Annulé', color: 'bg-gray-100 text-gray-600' },
  expired: { label: 'Expiré', color: 'bg-red-100 text-red-700' },
};

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

const PAYMENT_LABELS: Record<string, string> = {
  ccp: 'CCP',
  baridi_mob: 'BaridiMob',
  virement: 'Virement',
  cash: 'Espèces',
  dahabia: 'Dahabia',
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', { style: 'decimal' }).format(amount) + ' DA';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, active_plan')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return <div className="p-8"><p className="text-red-600">Agence introuvable</p></div>;
  }

  const [subscription, history] = await Promise.all([
    getActiveSubscription(agency.id),
    getSubscriptionHistory(agency.id),
  ]);

  const currentPlan = getPlanConfig(agency.active_plan);

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Abonnement</h1>
      <p className="mb-8 text-sm text-gray-500">Gérez votre plan et vos paiements</p>

      {/* Current Plan */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">Plan actuel</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{currentPlan.name}</p>
            <p className="mt-1 text-sm text-gray-500">{currentPlan.description}</p>
          </div>
          {currentPlan.badge && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {currentPlan.badge}
            </span>
          )}
        </div>

        {subscription && (
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABELS[subscription.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[subscription.status]?.label || subscription.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cycle</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {CYCLE_LABELS[subscription.billing_cycle] || subscription.billing_cycle}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Montant</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatPrice(subscription.price_dzd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {subscription.status === 'trial' ? 'Fin de l\'essai' : 'Prochaine échéance'}
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {subscription.status === 'trial' && subscription.trial_ends_at
                  ? formatDate(subscription.trial_ends_at)
                  : subscription.ends_at
                    ? formatDate(subscription.ends_at)
                    : '—'}
              </p>
            </div>
          </div>
        )}

        {!subscription && (
          <p className="mt-4 text-sm text-amber-600">
            Aucun abonnement actif. Souscrivez un plan pour continuer.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href="/pricing"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Changer de plan
          </Link>
        </div>
      </div>

      {/* Subscribe Form */}
      <SubscribeForm currentPlanId={agency.active_plan} />

      {/* Plan Limits */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Limites du plan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LimitCard
            label="Biens"
            value={currentPlan.limits.maxProperties === Infinity ? 'Illimité' : String(currentPlan.limits.maxProperties)}
          />
          <LimitCard
            label="Leads/mois"
            value={currentPlan.limits.maxLeadsPerMonth === Infinity ? 'Illimité' : String(currentPlan.limits.maxLeadsPerMonth)}
          />
          <LimitCard
            label="Membres"
            value={String(currentPlan.limits.maxMembers)}
          />
          <LimitCard
            label="Stockage"
            value={formatStorage(currentPlan.limits.maxStorageBytes)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['advancedAnalytics', 'exportLeads', 'luxuryBranding', 'customDomain', 'socialIntegration'] as const).map((feature) => (
            <span
              key={feature}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                currentPlan.limits[feature]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400 line-through'
              }`}
            >
              {FEATURE_LABELS[feature]}
            </span>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Historique</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Plan {getPlanConfig(sub.plan).name} — {CYCLE_LABELS[sub.billing_cycle] || sub.billing_cycle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(sub.starts_at)}
                    {sub.ends_at && ` → ${formatDate(sub.ends_at)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPrice(sub.price_dzd)}</p>
                  <span className={`text-xs ${STATUS_LABELS[sub.status]?.color || 'text-gray-500'}`}>
                    {STATUS_LABELS[sub.status]?.label || sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LimitCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatStorage(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)} Go`;
  return `${bytes / (1024 * 1024)} Mo`;
}

const FEATURE_LABELS: Record<string, string> = {
  advancedAnalytics: 'Analytics avancés',
  exportLeads: 'Export CSV',
  luxuryBranding: 'Branding luxury',
  customDomain: 'Domaine personnalisé',
  socialIntegration: 'Réseaux sociaux',
};
