import { Link } from "@/lib/i18n/navigation";
import { getGlobalStats } from "@/features/admin/services/admin.service";

interface StatCardProps {
  label: string;
  value: number;
  href: string;
  trend?: string;
}

function StatCard({ label, value, href, trend }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-amber-500 transition-colors">
        {new Intl.NumberFormat("fr-FR").format(value)}
      </p>
      {trend && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{trend}</p>
      )}
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getGlobalStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">Tableau de bord admin</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Vue globale de la plateforme AqarVision
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={stats.totalUsers}
          href="/admin/users"
          trend="Total profils enregistrés"
        />
        <StatCard
          label="Agences"
          value={stats.totalAgencies}
          href="/admin/agencies"
          trend="Agences actives"
        />
        <StatCard
          label="Annonces"
          value={stats.totalListings}
          href="/admin/agencies"
          trend="Toutes annonces"
        />
        <StatCard
          label="Leads"
          value={stats.totalLeads}
          href="/admin/agencies"
          trend="Contacts entrants"
        />
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/admin/verifications"
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 px-5 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
          >
            Examiner les demandes de vérification →
          </Link>
          <Link
            href="/admin/payments"
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 px-5 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-amber-500/10 dark:hover:bg-amber-500/20"
          >
            Paiements en attente →
          </Link>
          <Link
            href="/admin/agencies"
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Gérer les agences →
          </Link>
          <Link
            href="/admin/users"
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Gérer les utilisateurs →
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Paramètres plateforme →
          </Link>
        </div>
      </div>
    </div>
  );
}
