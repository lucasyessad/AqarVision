import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata = { title: "AqarPro · Créer un compte" };

export default async function ProSignUpPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: "#d4af37" }}>
          AqarPro
        </p>
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: "#f7fafc" }}>
          Créer un compte agence
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#718096" }}>
          Démarrez gratuitement, sans engagement.
        </p>
      </div>

      {/* SignUpForm with dark styling via wrapper */}
      <div className="[&_input]:bg-[#1a1f2e] [&_input]:border-[#2d3748] [&_input]:text-white [&_input:focus]:border-[#d4af37] [&_label]:text-[#a0aec0] [&_button[type=submit]]:bg-[#d4af37] [&_button[type=submit]]:text-[#0f1623]">
        <SignUpForm />
      </div>

      <p className="mt-6 text-center text-xs" style={{ color: "#4a5568" }}>
        Déjà un compte ?{" "}
        <Link href="/AqarPro/auth/login" className="hover:underline" style={{ color: "#d4af37" }}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
