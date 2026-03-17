import { Link } from "@/lib/i18n/navigation";
import { getAllAgencies } from "@/features/admin/services/admin.service";
import { AgenciesTableClient } from "./AgenciesTableClient";

const VERIFICATION_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "verified", label: "Vérifiées" },
  { value: "rejected", label: "Rejetées" },
  { value: "unverified", label: "Non vérifiées" },
] as const;

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}) {
  const { status = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const pageSize = 20;

  const { agencies, total } = await getAllAgencies({
    verification_status: status !== "all" ? status : undefined,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Agences</h1>
          <p className="mt-1 text-sm text-gray-400">
            {total} agence{total !== 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {VERIFICATION_FILTERS.map((filter) => {
          const isActive = status === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "all"
                  ? "/admin/agencies"
                  : `/admin/agencies?status=${filter.value}`
              }
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <AgenciesTableClient agencies={agencies} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/agencies?status=${status}&page=${page - 1}`}
                className="rounded-lg border border-gray-200 bg-white dark:bg-zinc-900 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/agencies?status=${status}&page=${page + 1}`}
                className="rounded-lg border border-gray-200 bg-white dark:bg-zinc-900 px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
