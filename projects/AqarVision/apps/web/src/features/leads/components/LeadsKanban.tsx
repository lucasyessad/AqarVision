"use client";

import { useState, useCallback } from "react";
import { updateLeadStatusAction } from "../actions/update-lead-status.action";
import { addLeadNoteAction } from "../actions/add-lead-note.action";
import type { LeadDto, LeadsByStatus, LeadStatus, LeadNoteDto } from "../types/leads.types";

const COLUMNS: { key: LeadStatus; label: string; color: string; headerBg: string; border: string }[] = [
  {
    key: "new",
    label: "Nouveau",
    color: "bg-blue-50",
    headerBg: "bg-blue-600",
    border: "border-blue-200",
  },
  {
    key: "contacted",
    label: "Contacté",
    color: "bg-amber-50",
    headerBg: "bg-amber-500",
    border: "border-amber-200",
  },
  {
    key: "qualified",
    label: "Qualifié",
    color: "bg-emerald-50",
    headerBg: "bg-emerald-600",
    border: "border-emerald-200",
  },
  {
    key: "closed",
    label: "Fermé",
    color: "bg-gray-50",
    headerBg: "bg-gray-500",
    border: "border-gray-200",
  },
];

const SOURCE_LABELS: Record<string, string> = {
  platform: "Plateforme",
  whatsapp: "WhatsApp",
  phone: "Téléphone",
};

/* ------------------------------------------------------------------ */
/*  LeadNotePanel — inline note display + add form                      */
/* ------------------------------------------------------------------ */

interface LeadNotePanelProps {
  leadId: string;
  agencyId: string;
  notes: LeadNoteDto[];
  onNotesUpdated: (leadId: string, notes: LeadNoteDto[]) => void;
}

function LeadNotePanel({
  leadId,
  agencyId,
  notes,
  onNotesUpdated,
}: LeadNotePanelProps) {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    setError(null);

    const result = await addLeadNoteAction({ leadId, agencyId, note: noteText });

    if (result.success) {
      onNotesUpdated(leadId, result.data.notes);
      setNoteText("");
    } else {
      setError(result.error.message);
    }
    setSaving(false);
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {notes.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {notes.map((n) => (
            <li key={n.id} className="rounded bg-white/70 p-2 text-xs text-gray-700">
              <p>{n.body}</p>
              <p className="mt-0.5 text-[10px] text-gray-400">
                {n.author_name} &middot;{" "}
                {new Date(n.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-1.5">
        <input
          type="text"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
          placeholder="Ajouter une note..."
          className="min-w-0 flex-1 rounded border border-gray-200 bg-white dark:bg-zinc-900 px-2 py-1 text-xs placeholder-gray-400 focus:border-zinc-900 focus:outline-none"
          disabled={saving}
        />
        <button
          type="button"
          onClick={handleAddNote}
          disabled={saving || !noteText.trim()}
          className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "..." : "OK"}
        </button>
      </div>
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadCard — draggable card with optional notes drawer                */
/* ------------------------------------------------------------------ */

interface LeadCardProps {
  lead: LeadDto;
  agencyId: string;
  onNotesUpdated: (leadId: string, notes: LeadNoteDto[]) => void;
  onDragStart: (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => void;
}

function LeadCard({ lead, agencyId, onNotesUpdated, onDragStart }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    lead.score === null
      ? "bg-gray-100 text-gray-500"
      : lead.score >= 80
        ? "bg-emerald-100 text-emerald-700"
        : lead.score >= 50
          ? "bg-amber-100 text-amber-700"
          : "bg-red-100 text-red-700";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id, lead.status)}
      className="cursor-grab rounded-lg border border-gray-100 bg-white dark:bg-zinc-900 p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      {/* Header */}
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{lead.contact_name}</p>
        {lead.score !== null && (
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${scoreColor}`}>
            {lead.score}
          </span>
        )}
      </div>

      {/* Phone */}
      {lead.contact_phone && (
        <p className="mb-1 text-xs text-gray-500">{lead.contact_phone}</p>
      )}

      {/* Listing */}
      <p className="mb-1.5 truncate text-xs text-zinc-900/80" title={lead.listing_title}>
        {lead.listing_title}
      </p>

      {/* Source + Date */}
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
          {SOURCE_LABELS[lead.source] ?? lead.source}
        </span>
        <span className="text-[10px] text-gray-400">
          {new Date(lead.created_at).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>

      {/* Notes toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex w-full items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-zinc-900 dark:text-zinc-100 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h6m-6 4h10M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
          />
        </svg>
        {lead.notes.length > 0 ? `${lead.notes.length} note(s)` : "Ajouter une note"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`ms-auto h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <LeadNotePanel
          leadId={lead.id}
          agencyId={agencyId}
          notes={lead.notes}
          onNotesUpdated={onNotesUpdated}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KanbanColumn                                                        */
/* ------------------------------------------------------------------ */

interface KanbanColumnProps {
  column: (typeof COLUMNS)[number];
  leads: LeadDto[];
  agencyId: string;
  onNotesUpdated: (leadId: string, notes: LeadNoteDto[]) => void;
  onDragStart: (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, toStatus: LeadStatus) => void;
}

function KanbanColumn({
  column,
  leads,
  agencyId,
  onNotesUpdated,
  onDragStart,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex min-h-[500px] flex-col rounded-xl border-2 ${column.border} ${column.color} transition-colors ${isDragOver ? "ring-2 ring-blue-night/30" : ""}`}
      onDragOver={(e) => {
        onDragOver(e);
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, column.key);
      }}
    >
      {/* Column header */}
      <div className={`rounded-t-lg ${column.headerBg} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{column.label}</h3>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold text-white">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-3">
        {leads.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8 text-xs text-gray-400">
            Aucun prospect
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              agencyId={agencyId}
              onNotesUpdated={onNotesUpdated}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LeadsKanban — main export                                           */
/* ------------------------------------------------------------------ */

interface LeadsKanbanProps {
  initialLeads: LeadsByStatus;
  agencyId: string;
}

export function LeadsKanban({ initialLeads, agencyId }: LeadsKanbanProps) {
  const [leads, setLeads] = useState<LeadsByStatus>(initialLeads);
  const [dragState, setDragState] = useState<{
    leadId: string;
    fromStatus: LeadStatus;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, leadId: string, fromStatus: LeadStatus) => {
      setDragState({ leadId, fromStatus });
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, toStatus: LeadStatus) => {
      e.preventDefault();
      if (!dragState) return;
      const { leadId, fromStatus } = dragState;
      setDragState(null);

      if (fromStatus === toStatus) return;

      // Find the lead
      const lead = leads[fromStatus].find((l) => l.id === leadId);
      if (!lead) return;

      // Optimistic update
      const prevLeads = { ...leads };
      setLeads((prev) => ({
        ...prev,
        [fromStatus]: prev[fromStatus].filter((l) => l.id !== leadId),
        [toStatus]: [{ ...lead, status: toStatus }, ...prev[toStatus]],
      }));
      setError(null);

      // Server action
      const result = await updateLeadStatusAction({
        leadId,
        agencyId,
        status: toStatus,
      });

      if (!result.success) {
        // Rollback
        setLeads(prevLeads);
        setError(result.error.message);
      }
    },
    [dragState, leads, agencyId]
  );

  const handleNotesUpdated = useCallback(
    (leadId: string, notes: LeadNoteDto[]) => {
      setLeads((prev) => {
        const updated = { ...prev };
        for (const statusKey of Object.keys(updated) as LeadStatus[]) {
          updated[statusKey] = updated[statusKey].map((l) =>
            l.id === leadId ? { ...l, notes } : l
          );
        }
        return updated;
      });
    },
    []
  );

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            column={col}
            leads={leads[col.key]}
            agencyId={agencyId}
            onNotesUpdated={handleNotesUpdated}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
