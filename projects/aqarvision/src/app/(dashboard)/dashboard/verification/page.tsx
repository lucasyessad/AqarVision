import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Clock, Upload, RotateCcw } from 'lucide-react';
import { submitVerification } from '@/lib/actions/verification';

export const metadata = {
  title: 'Vérification de l\'agence — AqarVision',
};

export default async function VerificationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, verification_status, is_verified, verified_at, verification_note')
    .eq('owner_id', user.id)
    .single();

  if (!agency) {
    return (
      <div className="p-8">
        <p className="text-red-600">Agence introuvable.</p>
      </div>
    );
  }

  const status = agency.verification_status as 'pending' | 'submitted' | 'verified' | 'rejected';

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Vérification de l&apos;agence</h1>
        <p className="mt-1 text-sm text-gray-500">
          Les agences vérifiées obtiennent un badge de confiance et un score de fiabilité plus élevé.
        </p>
      </div>

      {/* Verified state */}
      {status === 'verified' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-900">Agence vérifiée</h2>
              <p className="text-sm text-emerald-700">
                {agency.name} est une agence vérifiée par AqarVision.
              </p>
              {agency.verified_at && (
                <p className="mt-1 text-xs text-emerald-600">
                  Vérifiée le{' '}
                  {new Date(agency.verified_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-emerald-100 px-4 py-3">
            <p className="text-sm font-medium text-emerald-800">
              Avantages de la vérification :
            </p>
            <ul className="mt-2 space-y-1 text-sm text-emerald-700">
              <li>+ Badge &quot;Vérifiée&quot; sur toutes vos annonces</li>
              <li>+ 25 points au score de confiance</li>
              <li>+ Meilleur classement dans les résultats de recherche</li>
            </ul>
          </div>
        </div>
      )}

      {/* Submitted / under review */}
      {status === 'submitted' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Demande en cours d&apos;examen</h2>
              <p className="text-sm text-amber-700">
                Votre demande de vérification est en cours d&apos;examen par notre équipe. Ce processus
                prend généralement 1 à 3 jours ouvrables.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Vous serez notifié par email dès que votre demande sera traitée.
          </div>
        </div>
      )}

      {/* Rejected state */}
      {status === 'rejected' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Demande rejetée</h2>
                <p className="text-sm text-red-700">
                  Votre demande de vérification a été rejetée.
                </p>
              </div>
            </div>
            {agency.verification_note && (
              <div className="mt-4 rounded-xl bg-red-100 px-4 py-3">
                <p className="text-sm font-medium text-red-800">Motif du rejet :</p>
                <p className="mt-1 text-sm text-red-700">{agency.verification_note}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-900">Soumettre une nouvelle demande</h3>
            </div>
            <VerificationForm />
          </div>
        </div>
      )}

      {/* Pending state — initial submission form */}
      {status === 'pending' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Demander la vérification</h2>
          </div>
          <p className="mb-6 text-sm text-gray-500">
            Soumettez vos documents officiels pour obtenir le badge de vérification AqarVision.
          </p>

          <div className="mb-6 rounded-xl bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-800">Documents requis :</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>Registre de commerce (PDF ou image)</li>
              <li>Pièce d&apos;identité du gérant (PDF ou image)</li>
            </ul>
          </div>

          <VerificationForm />
        </div>
      )}
    </div>
  );
}

function VerificationForm() {
  return (
    <form action={submitVerification} className="space-y-5">
      <div>
        <label
          htmlFor="registre_commerce"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Registre de commerce <span className="text-red-500">*</span>
        </label>
        <input
          id="registre_commerce"
          name="registre_commerce"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700
            file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5
            file:text-sm file:font-medium file:text-blue-700
            hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">PDF, JPG ou PNG — max 5 Mo</p>
      </div>

      <div>
        <label
          htmlFor="id_document"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Pièce d&apos;identité <span className="text-red-500">*</span>
        </label>
        <input
          id="id_document"
          name="id_document"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700
            file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5
            file:text-sm file:font-medium file:text-blue-700
            hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">PDF, JPG ou PNG — max 5 Mo</p>
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
          transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Upload className="h-4 w-4" />
        Soumettre la demande
      </button>
    </form>
  );
}
