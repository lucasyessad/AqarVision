import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarPro · Mot de passe oublié" };

export default async function ProForgotPasswordPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#d4af37" }}>
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#f7fafc" }}>
          Mot de passe oublié
        </h2>
      </div>

      <div className="[&_input]:bg-[#1a1f2e] [&_input]:border-[#2d3748] [&_input]:text-white [&_input:focus]:border-[#d4af37] [&_label]:text-[#a0aec0] [&_p]:text-[#718096] [&_button[type=submit]]:bg-[#d4af37] [&_button[type=submit]]:text-[#0f1623]">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-xs">
        <Link href="/AqarPro/auth/login" className="hover:underline" style={{ color: "#d4af37" }}>
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
