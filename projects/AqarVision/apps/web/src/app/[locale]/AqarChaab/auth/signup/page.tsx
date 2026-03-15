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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
          AqarChaab
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Créer un compte
        </h2>
        <p className="mt-1 text-sm text-zinc-50/35">
          Gratuit, sans engagement.
        </p>
      </div>

      <ChaabSignUpForm locale={locale} />

      <p className="mt-6 text-center text-xs text-zinc-50/20">
        Déjà un compte ?{" "}
        <Link
          href="/AqarChaab/auth/login"
          className="hover:underline text-amber-500"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
