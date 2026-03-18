import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface AgencyStorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}

async function getAgencyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agencies")
    .select(
      "id, name, slug, theme, primary_color, accent_color, secondary_color, logo_url, storefront_content"
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function AgencyStorefrontLayout({
  children,
  params,
}: AgencyStorefrontLayoutProps) {
  const { slug } = await params;
  const t = await getTranslations("storefront");

  const agency = await getAgencyBySlug(slug);

  if (!agency) {
    notFound();
  }

  return (
    <div
      className="min-h-screen bg-white dark:bg-stone-950"
      data-agency-theme={agency.theme ?? "default"}
    >
      {children}
    </div>
  );
}
