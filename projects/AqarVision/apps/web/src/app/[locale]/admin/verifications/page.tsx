import { getPendingVerifications } from "@/features/admin/services/admin.service";
import { VerificationQueueClient } from "./VerificationQueueClient";

export default async function AdminVerificationsPage() {
  const verifications = await getPendingVerifications();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-night">File de vérification</h1>
        <p className="mt-1 text-sm text-gray-400">
          {verifications.length} demande{verifications.length !== 1 ? "s" : ""} en attente
          d&apos;examen
        </p>
      </div>

      <VerificationQueueClient verifications={verifications} />
    </div>
  );
}
