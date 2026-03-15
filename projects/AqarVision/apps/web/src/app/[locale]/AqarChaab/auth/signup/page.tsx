import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ChaabSignUpForm } from "@/features/auth/components/ChaabSignUpForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarChaab · Créer un compte" };

export default async function ChaabSignUpPage({ params }: PageProps) {
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
          Créer un compte
        </h2>
        <p className="mt-1 text-sm" style={{ color: "rgba(253,251,247,0.35)" }}>
          Gratuit, sans engagement.
        </p>
      </div>

      <ChaabSignUpForm locale={locale} />

      <p className="mt-6 text-center text-xs" style={{ color: "rgba(253,251,247,0.2)" }}>
        Déjà un compte ?{" "}
        <Link
          href="/AqarChaab/auth/login"
          className="hover:underline"
          style={{ color: "var(--or)" }}
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
