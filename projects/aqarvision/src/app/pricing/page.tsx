import Link from 'next/link';
import type { Metadata } from 'next';
import {
  PLAN_CONFIGS,
  TRIAL_DURATION_DAYS,
  getBillingDiscount,
  type PlanType,
} from '@/config';
import { getTranslations } from '@/lib/i18n';

const t = getTranslations('fr');

export const metadata: Metadata = {
  title: t('pricing.title'),
  description: t('pricing.description'),
};

/** Features affichées sur la page pricing avec labels i18n */
const FEATURE_LABELS: {
  key: string;
  labelKey: Parameters<typeof t>[0];
  getValue: (plan: PlanType) => string | boolean;
}[] = [
  {
    key: 'properties',
    labelKey: 'pricing.properties',
    getValue: (plan) => {
      const max = PLAN_CONFIGS[plan].limits.maxProperties;
      return max === Infinity ? t('pricing.unlimited') : `${max}`;
    },
  },
  {
    key: 'leads',
    labelKey: 'pricing.leadsPerMonth',
    getValue: (plan) => {
      const max = PLAN_CONFIGS[plan].limits.maxLeadsPerMonth;
      return max === Infinity ? t('pricing.unlimited') : `${max}`;
    },
  },
  {
    key: 'members',
    labelKey: 'pricing.members',
    getValue: (plan) => {
      const max = PLAN_CONFIGS[plan].limits.maxMembers;
      return `${max}`;
    },
  },
  {
    key: 'storage',
    labelKey: 'pricing.storage',
    getValue: (plan) => {
      const bytes = PLAN_CONFIGS[plan].limits.maxStorageBytes;
      if (bytes >= 1024 * 1024 * 1024) return `${bytes / (1024 * 1024 * 1024)} Go`;
      return `${bytes / (1024 * 1024)} Mo`;
    },
  },
  { key: 'social', labelKey: 'pricing.social', getValue: (plan) => PLAN_CONFIGS[plan].limits.socialIntegration },
  { key: 'export', labelKey: 'pricing.exportLeads', getValue: (plan) => PLAN_CONFIGS[plan].limits.exportLeads },
  { key: 'analytics', labelKey: 'pricing.advancedAnalytics', getValue: (plan) => PLAN_CONFIGS[plan].limits.advancedAnalytics },
  { key: 'luxury', labelKey: 'pricing.luxuryBranding', getValue: (plan) => PLAN_CONFIGS[plan].limits.luxuryBranding },
  { key: 'domain', labelKey: 'pricing.customDomain', getValue: (plan) => PLAN_CONFIGS[plan].limits.customDomain },
  {
    key: 'featured',
    labelKey: 'pricing.featuredProperties',
    getValue: (plan) => {
      const max = PLAN_CONFIGS[plan].limits.featuredProperties;
      if (max === 0) return false;
      return max === Infinity ? t('pricing.unlimited') : `${max}`;
    },
  },
];

function formatDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    maximumFractionDigits: 0,
  }).format(amount);
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function PricingPage() {
  const plans = Object.values(PLAN_CONFIGS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            Aqar<span className="text-blue-600">Vision</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">{t('nav.home')}</Link>
            <Link href="/pricing" className="font-medium text-blue-600">{t('pricing.title')}</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t('pricing.heading')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            <span className="font-semibold text-blue-600">{t('pricing.trialDays', { count: TRIAL_DURATION_DAYS })}</span>
            {' '}{t('pricing.noCommitment')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm text-green-700">
            <span className="font-medium">{t('pricing.localPayment')}</span> — {t('pricing.paymentMethods')}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'Populaire';
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 bg-white p-8 shadow-sm ${
                  isPopular
                    ? 'border-blue-600 shadow-blue-100'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold ${
                      isPopular
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

                {/* Monthly price */}
                <div className="mt-6">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {formatDZD(plan.pricing.monthlyDZD)}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">{t('pricing.perMonth')}</span>
                </div>

                {/* Annual savings */}
                <p className="mt-2 text-xs text-gray-500">
                  ou {formatDZD(plan.pricing.yearlyDZD)} {t('pricing.perYear')}
                  {' '}
                  <span className="font-medium text-green-600">
                    (-{getBillingDiscount('yearly')}%)
                  </span>
                </p>

                {/* CTA */}
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {t('pricing.freeTrial', { count: TRIAL_DURATION_DAYS })}
                </Link>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {FEATURE_LABELS.map(({ key, labelKey, getValue }) => {
                    const value = getValue(plan.id);
                    const isAvailable = value !== false;
                    const label = t(labelKey);

                    return (
                      <li key={key} className="flex items-center gap-3 text-sm">
                        {isAvailable ? <CheckIcon /> : <XIcon />}
                        <span className={isAvailable ? 'text-gray-700' : 'text-gray-400'}>
                          {label}
                          {typeof value === 'string' && (
                            <span className="ml-1 font-medium text-gray-900">({value})</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            {t('detail.comparison')}
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left font-medium text-gray-500">{t('pricing.feature')}</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="pb-4 text-center font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_LABELS.map(({ key, labelKey, getValue }) => (
                  <tr key={key} className="border-b">
                    <td className="py-4 text-gray-600">{t(labelKey)}</td>
                    {plans.map((plan) => {
                      const value = getValue(plan.id);
                      return (
                        <td key={plan.id} className="py-4 text-center">
                          {typeof value === 'boolean' ? (
                            value ? <span className="inline-block"><CheckIcon /></span> : <span className="inline-block"><XIcon /></span>
                          ) : (
                            <span className="font-medium text-gray-900">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('pricing.faq')}</h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-6">
            <div>
              <h3 className="font-semibold text-gray-900">{t('pricing.faq1.q')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('pricing.faq1.a', { count: TRIAL_DURATION_DAYS })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('pricing.faq2.q')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('pricing.faq2.a')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('pricing.faq3.q')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('pricing.faq3.a')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('pricing.faq4.q')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('pricing.faq4.a')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA bottom */}
        <div className="mt-24 rounded-2xl bg-blue-600 p-12 text-center text-white">
          <h2 className="text-3xl font-bold">{t('pricing.ctaHeading')}</h2>
          <p className="mt-4 text-blue-100">
            {t('pricing.ctaText', { count: TRIAL_DURATION_DAYS })}
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            {t('pricing.ctaButton')}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AqarVision. {t('footer.rights')}
      </footer>
    </div>
  );
}
