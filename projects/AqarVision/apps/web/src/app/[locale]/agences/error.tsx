"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Une erreur est survenue
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
        Nous n&apos;avons pas pu charger la liste des agences. Veuillez réessayer.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Réf: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <RotateCcw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
}
