import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ChaabLoginForm } from "@/features/auth/components/ChaabLoginForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarChaab · Connexion" };

export default async function ChaabLoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
          AqarChaab
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Mon espace
        </h2>
        <p className="mt-1 text-sm text-zinc-50/35">
          Particuliers — acheteurs, locataires, vendeurs.
        </p>
      </div>

      <ChaabLoginForm locale={locale} />

      <div className="mt-8 border-t border-zinc-50/[0.07] pt-6">
        <p className="text-center text-xs text-zinc-50/20">
          Vous êtes une agence ?{" "}
          <Link
            href="/AqarPro/auth/login"
            className="hover:underline text-amber-500"
          >
            Espace AqarPro →
          </Link>
        </p>
      </div>
    </div>
  );
}
