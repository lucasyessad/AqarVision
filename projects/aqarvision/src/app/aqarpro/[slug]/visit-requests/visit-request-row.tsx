'use client';

import { useState, useTransition } from 'react';
import { updateVisitRequestStatus, deleteVisitRequest } from '@/lib/actions/visit-request-management';

interface VisitRequestRowProps {
  request: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    message: string | null;
    status: string;
    propertyTitle: string | null;
    createdAt: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-green-100 text-green-700' },
  { value: 'declined', label: 'Refusée', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Effectuée', color: 'bg-blue-100 text-blue-700' },
];

export function VisitRequestRow({ request }: VisitRequestRowProps) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const statusOption = STATUS_OPTIONS.find((s) => s.value === request.status) || STATUS_OPTIONS[0];

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await updateVisitRequestStatus(request.id, e.target.value);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteVisitRequest(request.id);
    });
  }

  return (
    <>
      <tr className={`hover:bg-gray-50 ${isPending ? 'opacity-50' : ''}`}>
        <td className="px-6 py-4">
          <button onClick={() => setExpanded(!expanded)} className="text-left">
            <p className="font-medium text-gray-900">{request.name}</p>
            <p className="text-xs text-gray-500">{request.phone}</p>
            {request.email && <p className="text-xs text-gray-400">{request.email}</p>}
          </button>
        </td>
        <td className="px-6 py-4">
          {request.propertyTitle ? (
            <span className="text-sm text-gray-700">{request.propertyTitle}</span>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </td>
        <td className="px-6 py-4">
          <select
            value={request.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${statusOption.color}`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 text-xs text-gray-500">
          {new Date(request.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-1">
            {request.phone && (
              <a
                href={`tel:${request.phone}`}
                className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
              >
                Appeler
              </a>
            )}
            {showDelete ? (
              <>
                <button onClick={handleDelete} disabled={isPending}
                  className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50">
                  Oui
                </button>
                <button onClick={() => setShowDelete(false)}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  Non
                </button>
              </>
            ) : (
              <button onClick={() => setShowDelete(true)}
                className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">
                Supprimer
              </button>
            )}
          </div>
        </td>
      </tr>

      {expanded && request.message && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500">Message :</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{request.message}</p>
          </td>
        </tr>
      )}
    </>
  );
}
