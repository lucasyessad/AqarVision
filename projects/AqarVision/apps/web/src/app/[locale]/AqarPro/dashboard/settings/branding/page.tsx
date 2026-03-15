import { redirect } from "next/navigation";

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Branding is now integrated into the Appearance studio
  redirect(`/${locale}/AqarPro/dashboard/settings/appearance`);
}
