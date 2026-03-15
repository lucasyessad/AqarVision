import { Suspense } from "react";
import { MarketingHeaderWrapper } from "@/components/marketing/MarketingHeaderWrapper";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

function HeaderFallback({ locale }: { locale: string }) {
  // Renders instantly — same structure as real header, no auth state
  return <MarketingHeader locale={locale} user={null} />;
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Suspense fallback={<HeaderFallback locale={locale} />}>
        <MarketingHeaderWrapper locale={locale} />
      </Suspense>
      <main>{children}</main>
      <MarketingFooter locale={locale} />
    </>
  );
}
