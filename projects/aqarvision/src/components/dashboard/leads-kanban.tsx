'use client';

import { useState, useRef } from 'react';
import { updateLeadStatus } from '@/lib/actions/lead-management';
import { Phone, Mail, Home, GripVertical } from 'lucide-react';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'converted' | 'lost';

const COLUMNS: LeadStatus[] = ['new', 'contacted', 'qualified', 'negotiation', 'converted', 'lost'];

const COLUMN_LABELS: Record<LeadStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  negotiation: 'En négociation',
  converted: 'Converti',
  lost: 'Perdu',
};

const COLUMN_COLORS: Record<LeadStatus, { bg: string; border: string; header: string }> = {
  new: { bg: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-700' },
  contacted: { bg: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-700' },
  qualified: { bg: 'bg-purple-50', border: 'border-purple-200', header: 'text-purple-700' },
  negotiation: { bg: 'bg-orange-50', border: 'border-orange-200', header: 'text-orange-700' },
  converted: { bg: 'bg-emerald-50', border: 'border-emerald-200', header: 'text-emerald-700' },
  lost: { bg: 'bg-gray-50', border: 'border-gray-200', header: 'text-gray-500' },
};

const PRIORITY_BADGES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600',
  low: 'bg-gray-50 text-gray-400',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'Élevé',
  normal: 'Normal',
  low: 'Faible',
};

export interface KanbanLead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: LeadStatus;
  priority: string;
  score?: number | null;
  property_title?: string | null;
}

interface LeadsKanbanProps {
  initialLeads: KanbanLead[];
}

export function LeadsKanban({ initialLeads }: LeadsKanbanProps) {
  const [leads, setLeads] = useState<KanbanLead[]>(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<LeadStatus | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const draggedLeadRef = useRef<KanbanLead | null>(null);

  function getLeadsByStatus(status: LeadStatus): KanbanLead[] {
    return leads.filter((l) => l.status === status);
  }

  function handleDragStart(e: React.DragEvent, lead: KanbanLead) {
    draggedLeadRef.current = lead;
    setDraggingId(lead.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setOverColumn(null);
    draggedLeadRef.current = null;
  }

  function handleDragOver(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(status);
  }

  function handleDragLeave() {
    setOverColumn(null);
  }

  async function handleDrop(e: React.DragEvent, newStatus: LeadStatus) {
    e.preventDefault();
    setOverColumn(null);

    const lead = draggedLeadRef.current;
    if (!lead || lead.status === newStatus) {
      setDraggingId(null);
      return;
    }

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );
    setDraggingId(null);

    // Persist
    setUpdating(lead.id);
    const result = await updateLeadStatus(lead.id, newStatus);

    if (!result.success) {
      // Rollback on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status: lead.status } : l))
      );
    }
    setUpdating(null);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex min-w-full gap-4 p-1" style={{ minWidth: 900 }}>
        {COLUMNS.map((status) => {
          const colLeads = getLeadsByStatus(status);
          const colors = COLUMN_COLORS[status];
          const isOver = overColumn === status;

          return (
            <div
              key={status}
              className="flex w-64 flex-shrink-0 flex-col"
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column header */}
              <div
                className={`mb-3 flex items-center justify-between rounded-xl border ${colors.border} ${colors.bg} px-3 py-2`}
              >
                <span className={`text-sm font-semibold ${colors.header}`}>
                  {COLUMN_LABELS[status]}
                </span>
                <span
                  className={`rounded-full ${colors.bg} border ${colors.border} px-2 py-0.5 text-xs font-medium ${colors.header}`}
                >
                  {colLeads.length}
                </span>
              </div>

              {/* Drop zone */}
              <div
                className={`flex min-h-[120px] flex-col gap-2 rounded-xl border-2 p-2 transition-colors ${
                  isOver
                    ? `${colors.border} ${colors.bg} border-dashed`
                    : 'border-transparent'
                }`}
              >
                {colLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isDragging={draggingId === lead.id}
                    isUpdating={updating === lead.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {colLeads.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 py-6">
                    <p className="text-xs text-gray-400">Déposer ici</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LeadCardProps {
  lead: KanbanLead;
  isDragging: boolean;
  isUpdating: boolean;
  onDragStart: (e: React.DragEvent, lead: KanbanLead) => void;
  onDragEnd: () => void;
}

function LeadCard({ lead, isDragging, isUpdating, onDragStart, onDragEnd }: LeadCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={`group cursor-grab rounded-xl border border-gray-200 bg-white p-3 shadow-sm
        transition-all hover:shadow-md active:cursor-grabbing
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isUpdating ? 'animate-pulse' : ''}
      `}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 leading-tight">{lead.name}</span>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            PRIORITY_BADGES[lead.priority] ?? PRIORITY_BADGES.normal
          }`}
        >
          {PRIORITY_LABELS[lead.priority] ?? lead.priority}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{lead.phone}</span>
        </div>

        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}

        {lead.property_title && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Home className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{lead.property_title}</span>
          </div>
        )}
      </div>

      {lead.score != null && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${Math.min(100, lead.score)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">{lead.score}</span>
        </div>
      )}
    </div>
  );
}
