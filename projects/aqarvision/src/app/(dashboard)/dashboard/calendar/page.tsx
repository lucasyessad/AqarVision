import { CalendarDays } from 'lucide-react';

export const metadata = {
  title: 'Calendrier des visites — AqarVision',
};

export default function CalendarPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="mb-6 rounded-full bg-blue-100 p-6">
        <CalendarDays className="h-12 w-12 text-blue-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Calendrier des visites</h1>
      <p className="mt-2 text-base text-gray-500">Bientôt disponible</p>

      <div className="mt-8 max-w-md rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
        <p className="text-sm font-medium text-blue-900">
          Cette fonctionnalité est en cours de développement
        </p>
        <p className="mt-2 text-sm text-blue-700">
          Vous pourrez bientôt planifier et gérer toutes vos visites directement depuis votre
          tableau de bord. Recevez des rappels automatiques et synchronisez avec votre agenda.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: '📅', label: 'Planification des visites' },
          { icon: '🔔', label: 'Rappels automatiques' },
          { icon: '🔗', label: 'Sync agenda' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm"
          >
            <span className="text-lg">{feature.icon}</span>
            {feature.label}
          </div>
        ))}
      </div>
    </div>
  );
}
