"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Phone,
  MessageSquare,
  Globe,
  Calendar,
  ChevronRight,
  X,
  User,
  Clock,
  Flame,
  Home,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateLeadStatusAction } from "../actions/lead.action";
import type { Lead, LeadNote, LeadColumn } from "../types/lead.types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLUMNS: { status: Lead["status"]; label: string; color: string }[] = [
  {
    status: "new",
    label: "Nouveaux",
    color: "bg-blue-500 dark:bg-blue-400",
  },
  {
    status: "contacted",
    label: "Contactés",
    color: "bg-amber-500 dark:bg-amber-400",
  },
  {
    status: "qualified",
    label: "Qualifiés",
    color: "bg-green-500 dark:bg-green-400",
  },
  {
    status: "closed",
    label: "Fermés",
    color: "bg-stone-500 dark:bg-stone-400",
  },
];

const SOURCE_CONFIG: Record<Lead["source"], { icon: typeof Globe; label: string }> = {
  platform: { icon: Globe, label: "Plateforme" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp" },
  phone: { icon: Phone, label: "Téléphone" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface KanbanBoardProps {
  leads: Lead[];
  agencyId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByStatus(leads: Lead[]): Record<Lead["status"], Lead[]> {
  const grouped: Record<Lead["status"], Lead[]> = {
    new: [],
    contacted: [],
    qualified: [],
    closed: [],
  };
  for (const lead of leads) {
    grouped[lead.status].push(lead);
  }
  return grouped;
}

function getHeatColor(score: number): string {
  if (score <= 30) return "bg-blue-500 dark:bg-blue-400";
  if (score <= 60) return "bg-amber-500 dark:bg-amber-400";
  return "bg-red-500 dark:bg-red-400";
}

function getHeatLabel(score: number): string {
  if (score <= 30) return "Froid";
  if (score <= 60) return "Tiède";
  return "Chaud";
}

function formatRelativeDate(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}j`;
  return `${Math.floor(days / 30)}mo`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HeatScoreGauge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getHeatColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <span
        className={cn(
          "text-2xs font-medium",
          score <= 30 && "text-blue-600 dark:text-blue-400",
          score > 30 && score <= 60 && "text-amber-600 dark:text-amber-400",
          score > 60 && "text-red-600 dark:text-red-400"
        )}
      >
        {score}
      </span>
    </div>
  );
}

function LeadCard({
  lead,
  index,
  onSelect,
}: {
  lead: Lead;
  index: number;
  onSelect: (lead: Lead) => void;
}) {
  const SourceIcon = SOURCE_CONFIG[lead.source].icon;

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(lead)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(lead);
            }
          }}
          className={cn(
            "rounded-lg border border-stone-200 dark:border-stone-700",
            "bg-white dark:bg-stone-900 p-3",
            "cursor-grab active:cursor-grabbing",
            "transition-shadow duration-fast",
            "hover:shadow-md dark:hover:shadow-stone-950/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
            snapshot.isDragging && "shadow-lg dark:shadow-stone-950/70 rotate-1"
          )}
        >
          {/* Header: name + date */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
              {lead.sender_name}
            </p>
            <span className="text-2xs text-stone-500 dark:text-stone-400 shrink-0">
              {formatRelativeDate(lead.created_at)}
            </span>
          </div>

          {/* Listing title */}
          {lead.listing_title && (
            <div className="flex items-center gap-1 mt-1.5">
              <Home size={12} className="text-stone-400 dark:text-stone-500 shrink-0" />
              <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                {lead.listing_title}
              </p>
            </div>
          )}

          {/* Footer: source badge + heat score */}
          <div className="flex items-center justify-between mt-2.5">
            <Badge variant="default" size="sm">
              <SourceIcon size={10} className="me-1" />
              {SOURCE_CONFIG[lead.source].label}
            </Badge>
            <HeatScoreGauge score={lead.heat_score} />
          </div>
        </div>
      )}
    </Draggable>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  leads,
  onSelect,
}: {
  status: Lead["status"];
  label: string;
  color: string;
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}) {
  const tEmpty = useTranslations("common.empty");

  return (
    <div className="flex flex-col min-w-[272px] w-[272px] shrink-0 lg:min-w-0 lg:w-auto lg:flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
          {label}
        </h3>
        <span className="text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-full px-2 py-0.5">
          {leads.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 rounded-lg p-2 space-y-2 min-h-[200px]",
              "bg-stone-50 dark:bg-stone-800/50",
              "transition-colors duration-fast",
              snapshot.isDraggingOver && "bg-teal-50 dark:bg-teal-950/30"
            )}
          >
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onSelect={onSelect}
              />
            ))}
            {provided.placeholder}
            {leads.length === 0 && (
              <div className="flex items-center justify-center h-24 text-xs text-stone-400 dark:text-stone-500">
                {tEmpty("noLeads")}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lead Detail Drawer
// ---------------------------------------------------------------------------

function LeadDrawer({
  lead,
  agencyId,
  onClose,
}: {
  lead: Lead;
  agencyId: string;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const tEmpty = useTranslations("common.empty");
  const SourceIcon = SOURCE_CONFIG[lead.source].icon;

  function handleStatusChange(newStatus: Lead["status"]) {
    startTransition(async () => {
      await updateLeadStatusAction(
        { lead_id: lead.id, status: newStatus },
        agencyId
      );
      onClose();
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-stone-950/40 dark:bg-stone-950/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Détails du lead"
        className={cn(
          "fixed inset-y-0 end-0 z-50 w-full max-w-md",
          "bg-white dark:bg-stone-900",
          "border-s border-stone-200 dark:border-stone-700",
          "shadow-xl dark:shadow-stone-950/50",
          "overflow-y-auto",
          "animate-in slide-in-from-end duration-200"
        )}
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
            {lead.sender_name}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Contact info */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Contact
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                <Phone size={14} className="text-stone-400 dark:text-stone-500" />
                <a
                  href={`tel:${lead.sender_phone}`}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {lead.sender_phone}
                </a>
              </div>
              {lead.sender_email && (
                <div className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
                  <MessageSquare size={14} className="text-stone-400 dark:text-stone-500" />
                  <span>{lead.sender_email}</span>
                </div>
              )}
            </div>
          </section>

          {/* Meta: source, type, listing */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Informations
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-2.5">
                <p className="text-2xs text-stone-500 dark:text-stone-400 mb-0.5">Source</p>
                <div className="flex items-center gap-1 text-sm font-medium text-stone-800 dark:text-stone-200">
                  <SourceIcon size={14} />
                  {SOURCE_CONFIG[lead.source].label}
                </div>
              </div>
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-2.5">
                <p className="text-2xs text-stone-500 dark:text-stone-400 mb-0.5">Type</p>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 capitalize">
                  {lead.lead_type}
                </p>
              </div>
            </div>
            {lead.listing_title && (
              <div className="flex items-center gap-2 rounded-lg bg-stone-50 dark:bg-stone-800 p-2.5">
                <Home size={14} className="text-stone-400 dark:text-stone-500 shrink-0" />
                <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
                  {lead.listing_title}
                </p>
              </div>
            )}
          </section>

          {/* Heat score */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Score
            </h3>
            <div className="flex items-center gap-3">
              <Flame
                size={18}
                className={cn(
                  lead.heat_score <= 30 && "text-blue-500 dark:text-blue-400",
                  lead.heat_score > 30 && lead.heat_score <= 60 && "text-amber-500 dark:text-amber-400",
                  lead.heat_score > 60 && "text-red-500 dark:text-red-400"
                )}
              />
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", getHeatColor(lead.heat_score))}
                    style={{ width: `${lead.heat_score}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {lead.heat_score}/100
              </span>
              <Badge
                variant={
                  lead.heat_score <= 30 ? "info" : lead.heat_score <= 60 ? "warning" : "danger"
                }
                size="sm"
              >
                {getHeatLabel(lead.heat_score)}
              </Badge>
            </div>
          </section>

          {/* Timeline / notes */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Notes
            </h3>
            {lead.notes.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-stone-400 dark:text-stone-500">
                <StickyNote size={14} />
                {tEmpty("noNotes")}
              </div>
            ) : (
              <div className="space-y-2">
                {lead.notes.map((note: LeadNote, i: number) => (
                  <div
                    key={`${note.created_at}-${i}`}
                    className="rounded-lg border border-stone-200 dark:border-stone-700 p-2.5"
                  >
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                      {note.text}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={10} className="text-stone-400 dark:text-stone-500" />
                      <span className="text-2xs text-stone-400 dark:text-stone-500">
                        {formatRelativeDate(note.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Status actions */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Changer le statut
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {COLUMNS.filter((col) => col.status !== lead.status).map((col) => (
                <Button
                  key={col.status}
                  variant="outline"
                  size="sm"
                  loading={isPending}
                  onClick={() => handleStatusChange(col.status)}
                  className="justify-start"
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", col.color)} />
                  {col.label}
                </Button>
              ))}
            </div>
          </section>

          {/* Quick actions */}
          <section className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-2">
            <a
              href={`tel:${lead.sender_phone}`}
              className={cn(
                "flex items-center gap-2 w-full rounded-lg px-3 py-2.5",
                "text-sm font-medium text-stone-700 dark:text-stone-300",
                "bg-stone-50 dark:bg-stone-800",
                "hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              )}
            >
              <Phone size={16} className="text-teal-600 dark:text-teal-400" />
              Appeler
              <ChevronRight size={14} className="ms-auto text-stone-400 dark:text-stone-500" />
            </a>
            <a
              href={`https://wa.me/${lead.sender_phone.replace(/^0/, "213")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 w-full rounded-lg px-3 py-2.5",
                "text-sm font-medium text-stone-700 dark:text-stone-300",
                "bg-stone-50 dark:bg-stone-800",
                "hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              )}
            >
              <MessageSquare size={16} className="text-green-600 dark:text-green-400" />
              WhatsApp
              <ChevronRight size={14} className="ms-auto text-stone-400 dark:text-stone-500" />
            </a>
          </section>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile Tabs View
// ---------------------------------------------------------------------------

function MobileTabsView({
  grouped,
  agencyId,
  onSelect,
}: {
  grouped: Record<Lead["status"], Lead[]>;
  agencyId: string;
  onSelect: (lead: Lead) => void;
}) {
  const [activeTab, setActiveTab] = useState<Lead["status"]>("new");
  const [isPending, startTransition] = useTransition();
  const tEmpty = useTranslations("common.empty");

  function handleStatusChange(lead: Lead, newStatus: Lead["status"]) {
    startTransition(async () => {
      await updateLeadStatusAction(
        { lead_id: lead.id, status: newStatus },
        agencyId
      );
    });
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-700 overflow-x-auto">
        {COLUMNS.map((col) => (
          <button
            key={col.status}
            onClick={() => setActiveTab(col.status)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              "border-b-2 -mb-px",
              activeTab === col.status
                ? "border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400"
                : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", col.color)} />
            {col.label}
            <span className="text-xs bg-stone-100 dark:bg-stone-800 rounded-full px-1.5 py-0.5">
              {grouped[col.status].length}
            </span>
          </button>
        ))}
      </div>

      {/* Lead list */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {grouped[activeTab].length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-stone-400 dark:text-stone-500">
            {tEmpty("noLeads")}
          </div>
        )}
        {grouped[activeTab].map((lead) => {
          const SourceIcon = SOURCE_CONFIG[lead.source].icon;
          return (
            <div
              key={lead.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
            >
              {/* Avatar placeholder */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 shrink-0">
                <User size={16} className="text-stone-500 dark:text-stone-400" />
              </div>

              {/* Content — clickable */}
              <button
                onClick={() => onSelect(lead)}
                className="flex-1 min-w-0 text-start"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                    {lead.sender_name}
                  </p>
                  <Badge variant="default" size="sm">
                    <SourceIcon size={10} className="me-0.5" />
                    {SOURCE_CONFIG[lead.source].label}
                  </Badge>
                </div>
                {lead.listing_title && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                    {lead.listing_title}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <HeatScoreGauge score={lead.heat_score} />
                  <span className="text-2xs text-stone-400 dark:text-stone-500">
                    {formatRelativeDate(lead.created_at)}
                  </span>
                </div>
              </button>

              {/* Status dropdown */}
              <select
                value={lead.status}
                disabled={isPending}
                onChange={(e) =>
                  handleStatusChange(lead, e.target.value as Lead["status"])
                }
                className={cn(
                  "text-xs rounded-md border border-stone-200 dark:border-stone-700",
                  "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300",
                  "px-2 py-1.5 shrink-0",
                  "focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-400",
                  isPending && "opacity-50"
                )}
                aria-label="Changer le statut"
              >
                {COLUMNS.map((col) => (
                  <option key={col.status} value={col.status}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function KanbanBoard({ leads, agencyId }: KanbanBoardProps) {
  const [items, setItems] = useState(leads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [, startTransition] = useTransition();

  const grouped = groupByStatus(items);

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as Lead["status"];
    const oldStatus = source.droppableId as Lead["status"];

    // Optimistic update
    setItems((prev) =>
      prev.map((lead) =>
        lead.id === draggableId ? { ...lead, status: newStatus } : lead
      )
    );

    // Server Action call
    startTransition(async () => {
      const result = await updateLeadStatusAction(
        { lead_id: draggableId, status: newStatus },
        agencyId
      );
      if (!result.success) {
        // Revert on failure
        setItems((prev) =>
          prev.map((lead) =>
            lead.id === draggableId ? { ...lead, status: oldStatus } : lead
          )
        );
      }
    });
  }

  return (
    <>
      {/* Desktop: Kanban columns */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                color={col.color}
                leads={grouped[col.status]}
                onSelect={setSelectedLead}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Mobile: Tabbed list */}
      <div className="md:hidden">
        <MobileTabsView
          grouped={grouped}
          agencyId={agencyId}
          onSelect={setSelectedLead}
        />
      </div>

      {/* Drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          agencyId={agencyId}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </>
  );
}
