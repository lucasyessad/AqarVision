"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Eye,
  Check,
  X,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Building2,
  User,
  ImageIcon,
  FileText,
} from "lucide-react";
import { moderateListingAction } from "../actions/admin.action";
import type { ModerationItem, ModerationAction, ModerationFilters } from "../types/admin.types";
import type { ListingType } from "@/features/listings/schemas/listing.schema";

interface ModerationQueueProps {
  initialItems: ModerationItem[];
  initialTotal: number;
  initialPage: number;
  perPage: number;
}

export function ModerationQueue({
  initialItems,
  initialTotal,
  initialPage,
  perPage,
}: ModerationQueueProps) {
  const t = useTranslations("admin");
  const tEmpty = useTranslations("common.empty");
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    listingId: string;
    action: ModerationAction;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterOwner, setFilterOwner] = useState<string>("");

  const totalPages = Math.ceil(total / perPage);

  function getTitle(item: ModerationItem): string {
    const fr = item.translations.find((tr) => tr.locale === "fr");
    return fr?.title ?? item.translations[0]?.title ?? "Sans titre";
  }

  function getCoverUrl(item: ModerationItem): string | null {
    const cover = item.media.find((m) => m.is_cover) ?? item.media[0];
    return cover?.storage_path ?? null;
  }

  function handleAction(listingId: string, action: ModerationAction) {
    if (action === "approved") {
      startTransition(async () => {
        const result = await moderateListingAction(listingId, "approved");
        if (result.success) {
          setItems((prev) => prev.filter((i) => i.id !== listingId));
          setTotal((prev) => prev - 1);
        }
      });
    } else {
      setActionDialog({ listingId, action });
      setReason("");
    }
  }

  function submitAction() {
    if (!actionDialog) return;
    startTransition(async () => {
      const result = await moderateListingAction(
        actionDialog.listingId,
        actionDialog.action,
        reason
      );
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== actionDialog.listingId));
        setTotal((prev) => prev - 1);
        setActionDialog(null);
        setReason("");
      }
    });
  }

  const listingTypeLabels: Record<string, string> = {
    sale: "Vente",
    rent: "Location",
    vacation: "Vacances",
  };

  const propertyTypeLabels: Record<string, string> = {
    apartment: "Appartement",
    villa: "Villa",
    terrain: "Terrain",
    commercial: "Commercial",
    office: "Bureau",
    building: "Immeuble",
    farm: "Ferme",
    warehouse: "Entrepot",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Tous les types</option>
          <option value="sale">Vente</option>
          <option value="rent">Location</option>
          <option value="vacation">Vacances</option>
        </select>

        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="rounded-md border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">Tous les propriétaires</option>
          <option value="agency">Agence</option>
          <option value="individual">Particulier</option>
        </select>

        <span className="text-sm text-stone-500 dark:text-stone-400">
          {total} annonce{total !== 1 ? "s" : ""} en attente
        </span>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-12 text-center">
          <Eye className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            {tEmpty("noModeration")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items
            .filter((item) => !filterType || item.listing_type === filterType)
            .filter((item) => !filterOwner || item.owner_type === filterOwner)
            .map((item) => {
              const isExpanded = expandedId === item.id;
              const coverUrl = getCoverUrl(item);

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden"
                >
                  {/* Row summary */}
                  <div
                    className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : item.id)
                    }
                  >
                    {/* Cover thumbnail */}
                    <div className="h-14 w-20 shrink-0 rounded-md bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-stone-300 dark:text-stone-600" />
                        </div>
                      )}
                    </div>

                    {/* Title + info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {getTitle(item)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-400">
                          {listingTypeLabels[item.listing_type] ?? item.listing_type}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-600 dark:text-stone-400">
                          {propertyTypeLabels[item.property_type] ?? item.property_type}
                        </span>
                      </div>
                    </div>

                    {/* Owner */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      {item.owner_type === "agency" ? (
                        <>
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{item.agency?.name ?? "Agence"}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" />
                          <span>
                            {item.profile
                              ? `${item.profile.first_name} ${item.profile.last_name}`
                              : "Particulier"}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Wilaya */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{item.wilaya_code}</span>
                    </div>

                    {/* Date */}
                    <div className="hidden lg:flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item.id, "approved");
                        }}
                        disabled={isPending}
                        className="rounded-md bg-green-50 dark:bg-green-950 p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors disabled:opacity-50"
                        title="Approuver"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item.id, "rejected");
                        }}
                        disabled={isPending}
                        className="rounded-md bg-red-50 dark:bg-red-950 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors disabled:opacity-50"
                        title="Rejeter"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(item.id, "hidden");
                        }}
                        disabled={isPending}
                        className="rounded-md bg-amber-50 dark:bg-amber-950 p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors disabled:opacity-50"
                        title="Masquer"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Expand toggle */}
                    <div className="text-stone-400 dark:text-stone-500">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-stone-200 dark:border-stone-700 px-4 py-4 space-y-4 bg-stone-50 dark:bg-stone-800/30">
                      {/* Photos */}
                      {item.media.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wide">
                            Photos ({item.media.length})
                          </h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {item.media
                              .sort((a, b) => a.position - b.position)
                              .map((media) => (
                                <div
                                  key={media.id}
                                  className={cn(
                                    "h-24 w-32 shrink-0 rounded-md overflow-hidden",
                                    media.is_cover &&
                                      "ring-2 ring-teal-600 dark:ring-teal-400"
                                  )}
                                >
                                  <img
                                    src={media.storage_path}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {item.translations.map((tr) => (
                        <div key={tr.locale}>
                          <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1 uppercase tracking-wide">
                            Description ({tr.locale.toUpperCase()})
                          </h4>
                          <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line">
                            {tr.description}
                          </p>
                        </div>
                      ))}

                      {/* Price + details */}
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            Prix
                          </span>
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {new Intl.NumberFormat("fr-DZ", {
                              style: "currency",
                              currency: item.currency,
                              maximumFractionDigits: 0,
                            }).format(item.price)}
                          </p>
                        </div>
                        {item.details &&
                          typeof item.details === "object" &&
                          Object.entries(item.details)
                            .filter(([, v]) => v !== null && v !== undefined)
                            .slice(0, 6)
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="text-xs text-stone-500 dark:text-stone-400">
                                  {key}
                                </span>
                                <p className="text-sm text-stone-900 dark:text-stone-100">
                                  {String(value)}
                                </p>
                              </div>
                            ))}
                      </div>

                      {/* Documents */}
                      {item.documents.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wide">
                            Documents ({item.documents.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.documents.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.storage_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                {doc.document_type}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md p-1.5 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reject/Hide dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
              {actionDialog.action === "rejected"
                ? "Rejeter l'annonce"
                : "Masquer l'annonce"}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Indiquez la raison (minimum 10 caractères).
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-teal-600 resize-none"
              placeholder="Raison du rejet ou du masquage..."
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                Minimum 10 caractères ({reason.length}/10)
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setActionDialog(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={submitAction}
                disabled={reason.length < 10 || isPending}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
                  actionDialog.action === "rejected"
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                    : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
                )}
              >
                {isPending
                  ? "En cours..."
                  : actionDialog.action === "rejected"
                    ? "Rejeter"
                    : "Masquer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
