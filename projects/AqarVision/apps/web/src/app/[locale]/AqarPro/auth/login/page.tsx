import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ProLoginForm } from "@/features/auth/components/ProLoginForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarPro · Connexion" };

export default async function ProLoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Espace professionnel
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Réservé aux agences immobilières et agents.
        </p>
      </div>

      <ProLoginForm locale={locale} />

      <div className="mt-8 border-t border-zinc-800 pt-6">
        <p className="text-center text-xs text-zinc-600">
          Vous cherchez un bien ?{" "}
          <Link
            href="/AqarChaab/auth/login"
            className="text-amber-400 hover:underline"
          >
            Espace AqarChaab →
          </Link>
        </p>
      </div>
    </div>
  );
}
