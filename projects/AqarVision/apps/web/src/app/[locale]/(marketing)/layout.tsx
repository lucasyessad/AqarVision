import { FloatingNav } from "@/components/marketing/FloatingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <FloatingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
