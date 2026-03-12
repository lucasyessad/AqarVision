import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE = resolve(__dirname, '..');

function readSource(path: string): string {
  const full = resolve(BASE, path);
  if (!existsSync(full)) throw new Error(`File not found: ${full}`);
  return readFileSync(full, 'utf-8');
}

// ─── Dashboard Layout ─────────────────────────────────────────────

describe('dashboard layout', () => {
  const source = readSource('app/aqarpro/[slug]/layout.tsx');

  it('includes nav items via Sidebar component', () => {
    // Nav items are now defined in the Sidebar component
    const sidebarSource = readSource('components/dashboard/sidebar.tsx');
    expect(sidebarSource).toContain('Biens');
    expect(sidebarSource).toContain('Leads');
    expect(sidebarSource).toContain('Branding');
    expect(sidebarSource).toContain('Abonnement');
  });

  it('shows unread notification badge', () => {
    expect(source).toContain('unreadCount');
    expect(source).toContain('getUnreadNotificationsCount');
  });

  it('has logout link in sidebar', () => {
    // Logout is handled in the Sidebar component
    const sidebarSource = readSource('components/dashboard/sidebar.tsx');
    expect(sidebarSource).toContain('/logout');
  });
});

// ─── Dashboard Overview ───────────────────────────────────────────

describe('dashboard overview page', () => {
  const source = readSource('app/aqarpro/[slug]/dashboard/page.tsx');

  it('shows KPI stats', () => {
    expect(source).toContain('Biens actifs');
    expect(source).toContain('Leads ce mois');
    expect(source).toContain('Vues ce mois');
    expect(source).toContain('Taux de conversion');
  });

  it('shows plan usage via getPlanConfig', () => {
    expect(source).toContain('getPlanConfig');
    expect(source).toContain('maxProperties');
  });

  it('has quick action links', () => {
    expect(source).toContain('properties/new');
    expect(source).toContain('/leads');
  });
});

// ─── Team Page ────────────────────────────────────────────────────

describe('team page', () => {
  const source = readSource('app/aqarpro/[slug]/settings/team/page.tsx');

  it('shows member count vs limit', () => {
    expect(source).toContain('planConfig.limits.maxMembers');
    expect(source).toContain('getAgencyMembers');
  });

  it('shows owner row', () => {
    expect(source).toContain('Propriétaire');
    expect(source).toContain('Owner');
  });

  it('conditionally shows invite form for owner', () => {
    expect(source).toContain('isOwner');
    expect(source).toContain('InviteMemberForm');
  });
});

describe('team invite form', () => {
  const source = readSource('app/aqarpro/[slug]/settings/team/invite-form.tsx');

  it('has role selection', () => {
    expect(source).toContain('agent');
    expect(source).toContain('admin');
    expect(source).toContain('viewer');
  });

  it('shows limit warning', () => {
    expect(source).toContain('Limite de');
    expect(source).toContain('plan supérieur');
  });

  it('calls inviteMember action', () => {
    expect(source).toContain('inviteMember');
  });
});

// ─── Notifications Page ───────────────────────────────────────────

describe('notifications page', () => {
  const source = readSource('app/aqarpro/[slug]/notifications/page.tsx');

  it('shows unread count', () => {
    expect(source).toContain('getUnreadNotificationsCount');
    expect(source).toContain('non lue');
  });

  it('has mark all read button', () => {
    expect(source).toContain('MarkAllReadButton');
  });
});

describe('notification item', () => {
  const source = readSource('app/aqarpro/[slug]/notifications/notification-item.tsx');

  it('has type icons', () => {
    expect(source).toContain('new_lead');
    expect(source).toContain('subscription_expiring');
    expect(source).toContain('member_joined');
  });

  it('shows mark read and delete actions', () => {
    expect(source).toContain('markNotificationAsRead');
    expect(source).toContain('deleteNotification');
  });

  it('highlights unread notifications', () => {
    expect(source).toContain('bg-blue-50');
    expect(source).toContain('is_read');
  });
});

// ─── Billing Page ─────────────────────────────────────────────────

describe('billing page', () => {
  const source = readSource('app/aqarpro/[slug]/settings/billing/page.tsx');

  it('shows current plan info', () => {
    expect(source).toContain('Plan actuel');
    expect(source).toContain('getPlanConfig');
  });

  it('shows subscription status', () => {
    expect(source).toContain('getActiveSubscription');
    expect(source).toContain('Essai gratuit');
    expect(source).toContain('Actif');
    expect(source).toContain('Impayé');
  });

  it('shows payment methods in DZD', () => {
    expect(source).toContain('CCP');
    expect(source).toContain('BaridiMob');
    expect(source).toContain('Dahabia');
    expect(source).toContain('DA');
  });

  it('shows plan limits', () => {
    expect(source).toContain('Limites du plan');
    expect(source).toContain('maxProperties');
    expect(source).toContain('maxLeadsPerMonth');
  });

  it('shows feature badges', () => {
    expect(source).toContain('Analytics avancés');
    expect(source).toContain('Export CSV');
    expect(source).toContain('Branding luxury');
  });

  it('links to pricing page', () => {
    expect(source).toContain('/pricing');
    expect(source).toContain('Changer de plan');
  });
});

// ─── Analytics Page ───────────────────────────────────────────────

describe('analytics page', () => {
  const source = readSource('app/aqarpro/[slug]/analytics/page.tsx');

  it('is plan-gated to pro', () => {
    expect(source).toContain('planHasFeature');
    expect(source).toContain('advancedAnalytics');
    expect(source).toContain('Fonctionnalité Pro');
  });

  it('shows KPI cards', () => {
    expect(source).toContain('Vues totales');
    expect(source).toContain('Leads totaux');
    expect(source).toContain('Taux conversion');
  });

  it('shows top properties', () => {
    expect(source).toContain('getTopProperties');
    expect(source).toContain('Top biens');
  });

  it('shows leads by source', () => {
    expect(source).toContain('getLeadsBySource');
    expect(source).toContain('Leads par source');
  });

  it('shows leads pipeline', () => {
    expect(source).toContain('getLeadsByStatus');
    expect(source).toContain('Pipeline des leads');
  });

  it('calculates trends', () => {
    expect(source).toContain('viewsTrend');
    expect(source).toContain('leadsTrend');
  });
});

// ─── Lead Detail Page ─────────────────────────────────────────────

describe('lead detail page', () => {
  const source = readSource('app/aqarpro/[slug]/leads/[id]/page.tsx');

  it('shows lead info', () => {
    expect(source).toContain('lead.name');
    expect(source).toContain('lead.phone');
    expect(source).toContain('lead.email');
  });

  it('shows notes section', () => {
    expect(source).toContain('lead_notes');
    expect(source).toContain('LeadNoteForm');
  });

  it('shows timeline', () => {
    expect(source).toContain('LeadTimeline');
  });

  it('shows status and priority', () => {
    expect(source).toContain('STATUS_LABELS');
    expect(source).toContain('PRIORITY_LABELS');
  });

  it('has back link', () => {
    expect(source).toContain('/leads');
    expect(source).toContain('Retour aux leads');
  });
});

// ─── Export CSV ───────────────────────────────────────────────────

describe('export csv component', () => {
  const source = readSource('app/aqarpro/[slug]/leads/export-csv.tsx');

  it('generates CSV with BOM', () => {
    expect(source).toContain('\\uFEFF');
  });

  it('uses semicolon separator', () => {
    expect(source).toContain("join(';')");
  });

  it('creates download link', () => {
    expect(source).toContain('download');
    expect(source).toContain('.csv');
  });

  it('escapes double quotes in CSV', () => {
    expect(source).toContain('""');
  });
});

// ─── Image Upload Component ──────────────────────────────────────

describe('image upload component', () => {
  const source = readSource('components/dashboard/image-upload.tsx');

  it('supports drag and drop', () => {
    expect(source).toContain('onDrop');
    expect(source).toContain('onDragOver');
    expect(source).toContain('dragOver');
  });

  it('supports file input', () => {
    expect(source).toContain('type="file"');
    expect(source).toContain('accept="image/jpeg,image/png,image/webp"');
  });

  it('supports reordering', () => {
    expect(source).toContain('handleReorder');
    expect(source).toContain('draggable');
    expect(source).toContain('dragIndex');
  });

  it('shows position badges', () => {
    expect(source).toContain('index + 1');
    expect(source).toContain('Principale');
  });

  it('supports removing images', () => {
    expect(source).toContain('handleRemove');
  });

  it('enforces max image limit', () => {
    expect(source).toContain('maxImages');
    expect(source).toContain('remaining');
  });
});

// ─── SEO Pages ────────────────────────────────────────────────────

describe('SEO immobilier index page', () => {
  const source = readSource('app/(seo)/immobilier/page.tsx');

  it('lists Algerian wilayas', () => {
    expect(source).toContain('Alger');
    expect(source).toContain('Oran');
    expect(source).toContain('Constantine');
  });

  it('lists property types', () => {
    expect(source).toContain('appartement');
    expect(source).toContain('villa');
    expect(source).toContain('terrain');
  });

  it('has SEO metadata', () => {
    expect(source).toContain('Immobilier en Algérie');
    expect(source).toContain('metadata');
  });

  it('has SEO content section', () => {
    expect(source).toContain('AqarTrust');
    expect(source).toContain('score de confiance');
  });
});

describe('SEO wilaya page', () => {
  const source = readSource('app/(seo)/immobilier/[wilaya]/page.tsx');

  it('generates dynamic metadata', () => {
    expect(source).toContain('generateMetadata');
    expect(source).toContain('Vente & Location');
  });

  it('shows sale/rent split', () => {
    expect(source).toContain('transaction_type');
    expect(source).toContain('sale');
    expect(source).toContain('rent');
  });

  it('links to filtered search', () => {
    expect(source).toContain('/recherche?');
    expect(source).toContain('wilaya=');
  });

  it('has breadcrumb navigation', () => {
    expect(source).toContain('/immobilier');
  });
});

// ─── Search History (unified into /espace/historique) ──────────────

describe('search history page', () => {
  const source = readSource('app/espace/historique/page.tsx');

  it('uses AqarSearch queries', () => {
    expect(source).toContain('getSearchHistory');
  });

  it('has relative time formatting', () => {
    expect(source).toContain('formatRelativeTime');
  });

  it('builds search URLs from filters', () => {
    expect(source).toContain('buildSearchUrl');
  });
});
