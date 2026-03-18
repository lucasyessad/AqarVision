import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/features/auth/components/ProfileForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("profile") };
}

export default async function ProfilPage() {
  const t = await getTranslations("nav");
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, phone, avatar_url, preferred_locale")
    .eq("id", user.id)
    .single();

  const initialData = {
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? "",
    avatarUrl: profile?.avatar_url ?? null,
    preferredLocale: (profile?.preferred_locale ?? "fr") as "fr" | "ar" | "en" | "es",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {t("profile")}
      </h1>

      <div className="max-w-lg">
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
          <ProfileForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
