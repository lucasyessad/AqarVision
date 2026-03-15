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
        <p
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: "var(--or)" }}
        >
          AqarChaab
        </p>
        <h2
          className="mt-2 text-2xl font-semibold"
          style={{ color: "var(--ivoire)" }}
        >
          Mon espace
        </h2>
        <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.35)" }}>
          Particuliers — acheteurs, locataires, vendeurs.
        </p>
      </div>

      <ChaabLoginForm locale={locale} />

      <div
        className="mt-8 border-t pt-6"
        style={{ borderColor: "rgba(253,251,247,0.07)" }}
      >
        <p className="text-center text-xs" style={{ color: "rgba(253,251,247,0.2)" }}>
          Vous êtes une agence ?{" "}
          <Link
            href="/AqarPro/auth/login"
            className="hover:underline"
            style={{ color: "var(--or)" }}
          >
            Espace AqarPro →
          </Link>
        </p>
      </div>
    </div>
  );
}
