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
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#d4af37" }}>
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#f7fafc" }}>
          Espace professionnel
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#718096" }}>
          Réservé aux agences immobilières et agents.
        </p>
      </div>

      <ProLoginForm locale={locale} />

      <div className="mt-8 border-t pt-6" style={{ borderColor: "#1e2d4a" }}>
        <p className="text-center text-xs" style={{ color: "#4a5568" }}>
          Vous cherchez un bien ?{" "}
          <Link
            href="/AqarChaab/auth/login"
            className="hover:underline"
            style={{ color: "#d4af37" }}
          >
            Espace AqarChaab →
          </Link>
        </p>
      </div>
    </div>
  );
}
