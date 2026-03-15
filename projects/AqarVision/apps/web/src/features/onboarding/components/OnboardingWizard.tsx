"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { inviteMemberAction } from "@/features/agencies/actions/invite-member.action";
import type { ActionResult, InviteDto } from "@/features/agencies/types/agency.types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  agencyId: string;
  agencyName: string;
  agencyPhone: string | null;
  agencyWilaya: string | null;
  locale: string;
}

type StepId = "basics" | "branding" | "first-listing" | "invite-team";

interface Step {
  id: StepId;
  label: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "basics",
    label: "Informations de base",
    title: "Informations de base",
    description: "Vérifiez les informations principales de votre agence.",
  },
  {
    id: "branding",
    label: "Branding",
    title: "Identité visuelle",
    description: "Ajoutez votre logo et personnalisez les couleurs de votre vitrine.",
  },
  {
    id: "first-listing",
    label: "Première annonce",
    title: "Publiez votre première annonce",
    description: "Mettez en ligne votre premier bien immobilier.",
  },
  {
    id: "invite-team",
    label: "Équipe",
    title: "Invitez votre équipe",
    description: "Ajoutez des collaborateurs à votre agence.",
  },
];

const STORAGE_KEY = "aqar_onboarding_step";

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) {
  const percent = Math.round(((currentIndex + 1) / total) * 100);
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          Étape {currentIndex + 1} sur {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gold transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Step labels */}
      <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`text-center text-xs font-medium ${
              idx === currentIndex
                ? "text-blue-night"
                : idx < currentIndex
                  ? "text-green-600"
                  : "text-gray-400"
            }`}
          >
            {idx < currentIndex && (
              <span className="me-1">✓</span>
            )}
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 1: Basics ────────────────────────────────────────────────────────────

function StepBasics({
  agencyName,
  agencyPhone,
  agencyWilaya,
}: {
  agencyName: string;
  agencyPhone: string | null;
  agencyWilaya: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Informations actuelles
        </p>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Nom de l&apos;agence</p>
            <p className="font-semibold text-gray-800">{agencyName}</p>
          </div>
          {agencyPhone && (
            <div>
              <p className="text-xs text-gray-500">Téléphone</p>
              <p className="font-semibold text-gray-800">{agencyPhone}</p>
            </div>
          )}
          {agencyWilaya && (
            <div>
              <p className="text-xs text-gray-500">Wilaya</p>
              <p className="font-semibold text-gray-800">Wilaya {agencyWilaya}</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Pour modifier ces informations, rendez-vous dans{" "}
        <Link
          href="/AqarPro/dashboard/settings"
          className="font-medium text-blue-night hover:underline"
        >
          Paramètres de l&apos;agence
        </Link>
        .
      </p>
    </div>
  );
}

// ── Step 2: Branding ──────────────────────────────────────────────────────────

function StepBranding() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-night/10">
          <svg
            className="h-6 w-6 text-blue-night"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">Logo &amp; Image de couverture</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Ajoutez une identité visuelle professionnelle à votre vitrine.
          </p>
          <Link
            href="/AqarPro/dashboard/settings/branding"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-blue-night px-4 py-1.5 text-sm font-medium text-blue-night transition-colors hover:bg-blue-night hover:text-white"
          >
            Configurer le branding
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10">
          <svg
            className="h-6 w-6 text-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-800">Thème &amp; Couleurs</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Choisissez le thème de votre vitrine publique.
          </p>
          <Link
            href="/AqarPro/dashboard/settings/appearance"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gold px-4 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-white"
          >
            Personnaliser l&apos;apparence
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: First listing ─────────────────────────────────────────────────────

function StepFirstListing() {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <svg
          className="h-10 w-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <p className="mb-2 text-lg font-semibold text-gray-800">
        Publiez votre première annonce
      </p>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Commencez à attirer des clients en mettant en ligne votre premier bien
        immobilier sur AqarSearch.
      </p>
      <Link
        href="/AqarPro/dashboard/listings/new"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-night px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Créer une annonce
      </Link>
    </div>
  );
}

// ── Step 4: Invite team ───────────────────────────────────────────────────────

function StepInviteTeam({ agencyId }: { agencyId: string }) {
  const [state, formAction, isPending] = useActionState<
    ActionResult<InviteDto> | null,
    FormData
  >(inviteMemberAction, null);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Invitez vos collègues à rejoindre votre agence sur AqarPro.
      </p>

      {state?.success === false && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error.message}
        </div>
      )}
      {state?.success === true && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Invitation envoyée à {state.data.email} !
        </div>
      )}

      <form action={formAction} className="flex gap-3">
        <input type="hidden" name="agency_id" value={agencyId} />
        <input type="hidden" name="role" value="agent" />
        <input
          type="email"
          name="email"
          required
          placeholder="email@agence.dz"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-night focus:outline-none focus:ring-2 focus:ring-blue-night/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-night px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90 disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Inviter"}
        </button>
      </form>
      <p className="text-xs text-gray-400">
        Le membre sera invité avec le rôle &quot;Agent&quot;. Vous pourrez modifier son rôle
        depuis{" "}
        <Link href="/AqarPro/dashboard/team" className="underline">
          l&apos;équipe
        </Link>
        .
      </p>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function OnboardingWizard({
  agencyId,
  agencyName,
  agencyPhone,
  agencyWilaya,
  locale,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      const idx = saved ? parseInt(saved, 10) : 0;
      return Number.isNaN(idx) ? 0 : Math.min(idx, STEPS.length - 1);
    }
    return 0;
  });

  // Persist step in localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(stepIndex));
  }, [stepIndex]);

  const currentStep = STEPS[stepIndex];
  if (!currentStep) return null;
  const isLast = stepIndex === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/${locale}/AqarPro/dashboard`);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleSkip() {
    if (isLast) {
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/${locale}/AqarPro/dashboard`);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-night">
          Bienvenue sur AqarPro !
        </h1>
        <p className="mt-2 text-gray-500">
          Configurez votre agence en quelques étapes pour commencer à recevoir
          des clients.
        </p>
      </div>

      {/* Progress */}
      <ProgressBar currentIndex={stepIndex} total={STEPS.length} />

      {/* Step card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-xl font-bold text-blue-night">
          {currentStep.title}
        </h2>
        <p className="mb-6 text-sm text-gray-500">{currentStep.description}</p>

        {/* Step content */}
        {currentStep.id === "basics" && (
          <StepBasics
            agencyName={agencyName}
            agencyPhone={agencyPhone}
            agencyWilaya={agencyWilaya}
          />
        )}
        {currentStep.id === "branding" && <StepBranding />}
        {currentStep.id === "first-listing" && <StepFirstListing />}
        {currentStep.id === "invite-team" && (
          <StepInviteTeam agencyId={agencyId} />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            Passer cette étape
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-blue-night px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-night/90"
          >
            {isLast ? "Terminer" : "Étape suivante →"}
          </button>
        </div>
      </div>

      {/* Skip all */}
      <div className="mt-4 text-center">
        <Link
          href="/AqarPro/dashboard"
          onClick={() => localStorage.removeItem(STORAGE_KEY)}
          className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
        >
          Passer la configuration et aller au tableau de bord
        </Link>
      </div>
    </div>
  );
}
