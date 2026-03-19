import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Building2, Search, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationBadge } from "@/components/ui/VerificationBadge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("agencies") };
}

interface AgencyRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  email: string;
  logo_url: string | null;
  is_verified: boolean;
  whatsapp_phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  created_at: string;
}

export default async function AgencesPage() {
  const t = await getTranslations("nav");
  const tCommon = await getTranslations("common.buttons");
  const tEmpty = await getTranslations("common.empty");

  const supabase = await createClient();
  const { data: agencies, error } = await supabase
    .from("agencies")
    .select("id, name, slug, description, phone, email, logo_url, is_verified, whatsapp_phone, facebook_url, instagram_url, created_at")
    .order("created_at", { ascending: false });

  const agencyList = (agencies ?? []) as AgencyRow[];

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 lg:pt-28 lg:pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            {t("agencies")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Trouvez une agence immobilière de confiance
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder={tCommon("search")}
              className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 ps-9 pe-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:border-teal-600 dark:focus:border-teal-400"
            />
          </div>
        </div>

        {agencyList.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-16 w-16 text-stone-300 dark:text-stone-600 mb-4" />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {tEmpty("noAgencies")}
            </p>
          </div>
        ) : (
          /* Agency grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agencyList.map((agency) => (
              <Link
                key={agency.id}
                href={`/a/${agency.slug}`}
                className="group flex flex-col rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 transition-shadow hover:shadow-card"
              >
                {/* Header: logo + name */}
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                    {agency.logo_url ? (
                      <img
                        src={agency.logo_url}
                        alt={agency.name}
                        className="h-10 w-10 rounded object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-stone-400 dark:text-stone-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {agency.name}
                      </h3>
                      {agency.is_verified && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                    {agency.description && (
                      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                        {agency.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="mt-4 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {agency.phone}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
