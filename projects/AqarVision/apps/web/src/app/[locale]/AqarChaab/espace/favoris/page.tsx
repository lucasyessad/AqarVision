import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Heart, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth/get-cached-user";
import { redirect } from "next/navigation";
import {
  getUserFavorites,
  getUserCollections,
} from "@/features/favorites/services/favorite.service";
import { EmptyState } from "@/components/ui/EmptyState";
import { FavorisContent } from "./favoris-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("favorites") };
}

export default async function FavorisPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  const t = await getTranslations("nav");
  const user = await getCachedUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const params = await searchParams;
  const collectionId = params.collection ?? undefined;

  const [favorites, collections] = await Promise.all([
    getUserFavorites(supabase, user.id, collectionId),
    getUserCollections(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {t("favorites")}
        </h1>
      </div>

      <FavorisContent
        favorites={favorites}
        collections={collections}
        activeCollectionId={collectionId ?? null}
        userId={user.id}
      />
    </div>
  );
}
