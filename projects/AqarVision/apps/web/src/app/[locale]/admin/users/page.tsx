import { Link } from "@/lib/i18n/navigation";
import { getAllUsers } from "@/features/admin/services/admin.service";

const ROLE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "super_admin", label: "Super Admin" },
  { value: "user", label: "Utilisateurs" },
] as const;

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    super_admin: "bg-gold/20 text-gold",
    user: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] ?? "bg-gray-100 text-gray-500"}`}
    >
      {role}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    role?: string;
    page?: string;
  }>;
}) {
  const { role = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const pageSize = 25;

  const { users, total } = await getAllUsers({
    role: role !== "all" ? role : undefined,
    page,
    pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-night">Utilisateurs</h1>
        <p className="mt-1 text-sm text-gray-400">
          {total} utilisateur{total !== 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {ROLE_FILTERS.map((filter) => {
          const isActive = role === filter.value;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "all" ? "/admin/users" : `/admin/users?role=${filter.value}`
              }
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-night text-blue-night"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
          Aucun utilisateur trouvé.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Rôle
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.user_id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-blue-night">
                      {u.full_name ?? "—"}
                    </p>
                    <p className="font-mono text-xs text-gray-400">{u.user_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?role=${role}&page=${page - 1}`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?role=${role}&page=${page + 1}`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50"
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
