import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { createClient } from "@/lib/supabase/server";
import { getWilayas } from "@/features/marketplace/services/search.service";
import { AgencesClient } from "./AgencesClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "Agences immobilières · AqarVision" };

export default async function AgencesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [{ data: agencies }, { data: branches }, wilayas] = await Promise.all([
    supabase
      .from("agencies")
      .select("id, name, slug, logo_url, description, is_verified")
      .is("deleted_at", null)
      .order("is_verified", { ascending: false })
      .order("name")
      .limit(200),
    supabase
      .from("agency_branches")
      .select("agency_id, wilaya_code")
      .order("agency_id"),
    getWilayas(supabase),
  ]);

  // Build a map: agency_id -> wilaya_codes[]
  const agencyWilayaMap: Record<string, string[]> = {};
  for (const b of branches ?? []) {
    const aid = b.agency_id as string;
    const wc = b.wilaya_code as string;
    if (!agencyWilayaMap[aid]) agencyWilayaMap[aid] = [];
    if (!agencyWilayaMap[aid].includes(wc)) agencyWilayaMap[aid].push(wc);
  }

  // Build wilaya name map
  const wilayaNameMap: Record<string, string> = {};
  for (const w of wilayas) {
    wilayaNameMap[w.code] = w.name;
  }

  return (
    <>
      <Suspense fallback={<MarketingHeader locale={locale} user={null} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>

      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <AgencesClient
          agencies={(agencies ?? []).map((a) => ({
            id: a.id as string,
            name: a.name as string,
            slug: a.slug as string,
            logo_url: (a.logo_url as string) ?? null,
            description: (a.description as string) ?? null,
            is_verified: (a.is_verified as boolean) ?? false,
            wilaya_codes: agencyWilayaMap[a.id as string] ?? [],
          }))}
          wilayas={wilayas}
          wilayaNameMap={wilayaNameMap}
          locale={locale}
        />
      </main>

      <MarketingFooter locale={locale} />
    </>
  );
}
