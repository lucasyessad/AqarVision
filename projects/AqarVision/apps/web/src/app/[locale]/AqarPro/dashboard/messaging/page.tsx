import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { redirect } from "next/navigation";
import { getConversations } from "@/features/messaging/services/messaging.service";
import { MessagingView } from "@/features/messaging/components/MessagingView";
import { getAgencyForUser } from "@/lib/auth/get-agency-for-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("messages") };
}

export default async function MessagingPage() {
  const t = await getTranslations("nav");
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const agency = await getAgencyForUser(user.id);

  if (!agency) {
    redirect("/AqarChaab/espace/messagerie");
  }

  const supabase = await createClient();
  const conversations = await getConversations(supabase, user.id, agency.agencyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("messages")}
        </h1>
      </div>

      <MessagingView
        userId={user.id}
        agencyId={agency.agencyId}
        initialConversations={conversations}
      />
    </div>
  );
}
