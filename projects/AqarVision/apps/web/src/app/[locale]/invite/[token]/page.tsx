import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { UserPlus, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { AcceptInvitationButton } from "./accept-invitation-button";

interface Props {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.invite");
  return { title: t("title") };
}

export default async function InvitePage({ params }: Props) {
  const { token, locale } = await params;
  const t = await getTranslations("auth.invite");
  const supabase = await createClient();
  const user = await getCachedUser();

  // Fetch invitation details
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(
      `
      id, email, role, status, expires_at,
      agency:agencies(name, slug, logo_url)
    `
    )
    .eq("token", token)
    .single();

  if (error || !invitation) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t("notFound")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("notFoundDescription")}
          </p>
        </div>
      </div>
    );
  }

  const agency = invitation.agency as unknown as { name: string; slug: string; logo_url: string | null } | null;
  const isExpired = new Date(invitation.expires_at as string) < new Date();
  const isAlreadyAccepted = invitation.status === "accepted";

  // If expired
  if (isExpired || invitation.status === "expired") {
    return (
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t("expired")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("expiredDescription")}
          </p>
        </div>
      </div>
    );
  }

  // If already accepted
  if (isAlreadyAccepted) {
    return (
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t("alreadyAccepted")}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("alreadyAcceptedDescription")}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to signup with return URL
  if (!user) {
    redirect(`/${locale}/auth/signup?redirect=/${locale}/invite/${token}`);
  }

  // Valid invitation — show accept UI
  const roleLabels: Record<string, string> = {
    admin: "Admin",
    agent: "Agent",
    editor: "Éditeur",
    viewer: "Lecteur",
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-8 text-center shadow-card">
          <div className="mx-auto h-14 w-14 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mb-4">
            <UserPlus className="h-7 w-7 text-teal-600 dark:text-teal-400" />
          </div>

          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t("title")}
          </h1>

          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("description")}
          </p>

          {/* Agency info */}
          <div className="mt-6 rounded-lg bg-stone-50 dark:bg-stone-800 p-4">
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {agency?.name}
            </p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {t("role")}: <span className="font-medium text-teal-600 dark:text-teal-400">{roleLabels[invitation.role as string] ?? invitation.role}</span>
            </p>
          </div>

          {/* Accept button */}
          <div className="mt-6">
            <AcceptInvitationButton token={token} />
          </div>

          <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
            {t("expiresNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
