import Link from 'next/link';
import type { Metadata } from 'next';
import {
  PLAN_CONFIGS,
  TRIAL_DURATION_DAYS,
  getBillingDiscount,
  type PlanType,
} from '@/config';
import { getTranslations } from '@/lib/i18n';
import { FadeInUp, StaggerContainer, ScaleIn } from '@/components/ui/animated-sections';

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
    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
  );
}

function XIcon() {
  return (
    <span className="text-muted-foreground/40">&mdash;</span>
  );
}

export default function PricingPage() {
  const plans = Object.values(PLAN_CONFIGS);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-glass fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-vitrine text-xl tracking-tight text-foreground">
            AqarVision
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">{t('nav.home')}</Link>
            <Link href="/pricing" className="font-medium text-foreground">{t('pricing.title')}</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <FadeInUp>
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
              {t('pricing.title')}
            </p>
          </FadeInUp>
          <FadeInUp delay={0.1}>
            <h1 className="font-vitrine text-display-lg text-foreground mb-5">
              {t('pricing.heading')}
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.15}>
            <p className="text-body-lg text-muted-foreground max-w-xl mx-auto">
              <span className="font-semibold text-foreground">{t('pricing.trialDays', { count: TRIAL_DURATION_DAYS })}</span>
              {' '}{t('pricing.noCommitment')}
            </p>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              <span className="font-medium">{t('pricing.localPayment')}</span> — {t('pricing.paymentMethods')}
            </div>
          </FadeInUp>
        </div>

        {/* Plan Cards */}
        <StaggerContainer className="grid gap-6 lg:grid-cols-3 items-start">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'Populaire';
            return (
              <FadeInUp key={plan.id}>
                <div
                  className={`relative rounded-2xl p-8 transition-all ${
                    isPopular
                      ? 'bg-bleu-nuit text-white shadow-float md:scale-105 md:-my-4 z-10 ring-1 ring-bleu-nuit'
                      : 'glass-card border border-border shadow-card'
                  }`}
                >
                  {plan.badge && (
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${
                      isPopular ? 'text-or' : 'text-accent-500'
                    }`}>
                      {plan.badge}
                    </p>
                  )}

                  <h2 className={`text-lg font-semibold mb-1 ${isPopular ? 'text-white' : 'text-foreground'}`}>
                    {plan.name}
                  </h2>
                  <p className={`text-body-sm mb-5 ${isPopular ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>

                  {/* Monthly price */}
                  <div className="mb-2">
                    <span className={`text-heading-2 font-extrabold ${isPopular ? 'text-white' : 'text-foreground'}`}>
                      {formatDZD(plan.pricing.monthlyDZD)}
                    </span>
                    <span className={`ml-1 text-sm ${isPopular ? 'text-white/50' : 'text-muted-foreground'}`}>
                      {t('pricing.perMonth')}
                    </span>
                  </div>

                  {/* Annual savings */}
                  <p className={`text-xs mb-6 ${isPopular ? 'text-white/40' : 'text-muted-foreground'}`}>
                    ou {formatDZD(plan.pricing.yearlyDZD)} {t('pricing.perYear')}
                    {' '}
                    <span className={isPopular ? 'text-or font-medium' : 'font-medium text-emerald-600'}>
                      (-{getBillingDiscount('yearly')}%)
                    </span>
                  </p>

                  {/* CTA */}
                  <Link
                    href="/signup"
                    className={`block rounded-xl py-3 text-center text-sm font-semibold transition-colors mb-8 ${
                      isPopular
                        ? 'bg-or text-white hover:bg-or/90'
                        : 'bg-foreground text-background hover:opacity-90'
                    }`}
                  >
                    {t('pricing.freeTrial', { count: TRIAL_DURATION_DAYS })}
                  </Link>

                  {/* Features */}
                  <div className={`border-t ${isPopular ? 'border-white/10' : 'border-border'} pt-6`}>
                    <p className={`text-caption font-semibold uppercase tracking-wider mb-4 ${
                      isPopular ? 'text-white/40' : 'text-muted-foreground'
                    }`}>
                      Inclus
                    </p>
                    <ul className="space-y-3">
                      {FEATURE_LABELS.map(({ key, labelKey, getValue }) => {
                        const value = getValue(plan.id);
                        const isAvailable = value !== false;
                        const label = t(labelKey);

                        return (
                          <li key={key} className="flex items-center gap-3 text-sm">
                            {isAvailable ? <CheckIcon /> : <XIcon />}
                            <span className={
                              isAvailable
                                ? (isPopular ? 'text-white/80' : 'text-foreground')
                                : (isPopular ? 'text-white/25' : 'text-muted-foreground/50')
                            }>
                              {label}
                              {typeof value === 'string' && (
                                <span className={`ml-1 font-medium ${isPopular ? 'text-white' : 'text-foreground'}`}>
                                  ({value})
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </FadeInUp>
            );
          })}
        </StaggerContainer>

        {/* Comparison Table */}
        <div className="mt-24">
          <FadeInUp>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
                Comparatif
              </p>
              <h2 className="font-vitrine text-display-md text-foreground">
                {t('detail.comparison')}
              </h2>
            </div>
          </FadeInUp>
          <ScaleIn>
            <div className="rounded-2xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-5 text-left text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('pricing.feature')}
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="p-5 text-center font-semibold text-foreground">
                        {plan.name}
                        {plan.badge === 'Populaire' && (
                          <span className="ml-2 text-xs text-or font-medium">Populaire</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_LABELS.map(({ key, labelKey, getValue }, i) => (
                    <tr key={key} className={i < FEATURE_LABELS.length - 1 ? 'border-b border-border' : ''}>
                      <td className="p-5 text-foreground">{t(labelKey)}</td>
                      {plans.map((plan) => {
                        const value = getValue(plan.id);
                        return (
                          <td key={plan.id} className="p-5 text-center">
                            {typeof value === 'boolean' ? (
                              value ? <span className="inline-flex justify-center"><CheckIcon /></span> : <XIcon />
                            ) : (
                              <span className="font-medium text-foreground">{value}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScaleIn>
        </div>

        {/* FAQ */}
        <FadeInUp>
          <div className="mt-24 max-w-2xl mx-auto">
            <h2 className="text-center font-vitrine text-display-md text-foreground mb-8">{t('pricing.faq')}</h2>
            <div className="divide-y divide-border">
              {[
                { q: t('pricing.faq1.q'), a: t('pricing.faq1.a', { count: TRIAL_DURATION_DAYS }) },
                { q: t('pricing.faq2.q'), a: t('pricing.faq2.a') },
                { q: t('pricing.faq3.q'), a: t('pricing.faq3.a') },
                { q: t('pricing.faq4.q'), a: t('pricing.faq4.a') },
              ].map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-body font-medium text-foreground pr-4">{q}</span>
                    <svg
                      className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0"
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </summary>
                  <p className="text-body-sm text-muted-foreground mt-3 pr-8 leading-relaxed">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* CTA bottom */}
        <FadeInUp>
          <div className="mt-24 rounded-3xl bg-bleu-nuit p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,150,62,0.08),transparent_50%)]" />
            <div className="relative">
              <h2 className="font-vitrine text-display-md text-white mb-4">{t('pricing.ctaHeading')}</h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {t('pricing.ctaText', { count: TRIAL_DURATION_DAYS })}
              </p>
              <Link
                href="/signup"
                className="inline-block rounded-xl bg-or px-8 py-3 font-semibold text-white hover:bg-or/90 transition-colors"
              >
                {t('pricing.ctaButton')}
              </Link>
            </div>
          </div>
        </FadeInUp>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-caption text-muted-foreground">
        &copy; {new Date().getFullYear()} AqarVision. {t('footer.rights')}
      </footer>
    </div>
  );
}
