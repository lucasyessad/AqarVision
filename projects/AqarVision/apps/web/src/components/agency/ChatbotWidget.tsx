'use client'

/**
 * ChatbotWidget
 *
 * Floating chatbot CTA for agency storefronts.
 * Opens a 320px panel with a multi-step wizard:
 *   Step 1 — Type de bien
 *   Step 2 — Budget
 *   Step 3 — Wilaya
 *   Step 4 — Coordonnées (name + phone/email)
 *   Step 5 — Confirmation / merci
 *
 * On final step: calls createLeadFromChatbot server action.
 * Positioned just above the WhatsApp button (bottom-20 instead of bottom-6).
 *
 * Uses CSS logical properties (end-6 not right-6).
 */

import { useState, useRef, useEffect } from 'react'
import { createLeadFromChatbot } from '@/features/leads/actions/create-lead-chatbot.action'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatbotWidgetProps {
  agencyId: string
  agencyName: string
}

type Step = 'property_type' | 'budget' | 'wilaya' | 'contact' | 'done'

interface ChatState {
  property_type: string
  budget: string
  wilaya: string
  contact_name: string
  contact_phone: string
  contact_email: string
}

const INITIAL_STATE: ChatState = {
  property_type: '',
  budget: '',
  wilaya: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
}

const STEPS: Step[] = ['property_type', 'budget', 'wilaya', 'contact', 'done']

const PROPERTY_TYPE_OPTIONS = [
  'Appartement',
  'Villa',
  'Local commercial',
  'Terrain',
  'Bureau',
  'Autre',
]

const BUDGET_OPTIONS = [
  'Moins de 5M DA',
  '5M – 10M DA',
  '10M – 20M DA',
  '20M – 50M DA',
  'Plus de 50M DA',
]

// ── Bot icon ──────────────────────────────────────────────────────────────────

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2zM7 14a5 5 0 0010 0H7zm3 2h4v1H10v-1zm-1-4a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  )
}

// ── Step label ────────────────────────────────────────────────────────────────

function stepLabel(step: Step, agencyName: string): string {
  switch (step) {
    case 'property_type':
      return 'Quel type de bien cherchez-vous ?'
    case 'budget':
      return 'Quel est votre budget ?'
    case 'wilaya':
      return 'Quelle wilaya vous intéresse ?'
    case 'contact':
      return 'Vos coordonnées pour qu\'on vous rappelle'
    case 'done':
      return `Merci ! ${agencyName} vous recontactera bientôt.`
  }
}

// ── Step progress bar ─────────────────────────────────────────────────────────

function StepProgress({ current }: { current: Step }) {
  const dataSteps: Step[] = ['property_type', 'budget', 'wilaya', 'contact']
  const idx = dataSteps.indexOf(current)
  if (idx < 0) return null

  return (
    <div className="flex gap-1" role="progressbar" aria-valuenow={idx + 1} aria-valuemax={4}>
      {dataSteps.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= idx
              ? 'bg-[var(--agency-primary,#1a365d)]'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// ── Option button ─────────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-2 text-start text-sm transition-colors ${
        selected
          ? 'border-[var(--agency-primary,#1a365d)] bg-[var(--agency-primary,#1a365d)] text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

// ── ChatbotWidget ─────────────────────────────────────────────────────────────

export default function ChatbotWidget({ agencyId, agencyName }: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('property_type')
  const [state, setState] = useState<ChatState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Trap focus inside panel when open
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  function reset() {
    setStep('property_type')
    setState(INITIAL_STATE)
    setError(null)
    setSubmitting(false)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleOpen() {
    setOpen(true)
    reset()
  }

  function advance() {
    const currentIdx = STEPS.indexOf(step)
    const next = STEPS[currentIdx + 1]
    if (next) setStep(next)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const result = await createLeadFromChatbot({
      agency_id: agencyId,
      property_type: state.property_type || undefined,
      budget: state.budget || undefined,
      wilaya: state.wilaya || undefined,
      contact_name: state.contact_name,
      contact_phone: state.contact_phone || undefined,
      contact_email: state.contact_email || undefined,
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.error.message)
      return
    }

    setStep('done')
  }

  const currentStepIdx = STEPS.indexOf(step)
  const isLastDataStep = step === 'contact'

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Fermer le chat' : `Chatter avec ${agencyName}`}
        aria-expanded={open}
        className="fixed bottom-24 end-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--agency-primary,#1a365d)]/30"
        style={{ background: 'var(--agency-primary, #1a365d)' }}
      >
        {open ? (
          <CloseIcon className="h-5 w-5 text-white" />
        ) : (
          <BotIcon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label={`Chat avec ${agencyName}`}
          aria-modal="true"
          className="fixed bottom-40 end-6 z-50 flex w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none"
          style={{ maxHeight: 'min(520px, calc(100dvh - 12rem))' }}
        >
          {/* Header */}
          <div
            className="flex shrink-0 items-center gap-3 px-4 py-3"
            style={{ background: 'var(--agency-primary, #1a365d)' }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
              <BotIcon className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{agencyName}</p>
              <p className="text-xs text-white/60">Assistant virtuel</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="ms-auto shrink-0 text-white/70 transition-colors hover:text-white"
              aria-label="Fermer"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Progress (data steps only) */}
          {step !== 'done' && (
            <div className="shrink-0 px-4 pt-3">
              <StepProgress current={step} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* Question */}
            <div className="mb-4 flex items-start gap-2">
              <div
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--agency-primary, #1a365d)' }}
              >
                <BotIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {stepLabel(step, agencyName)}
              </div>
            </div>

            {/* Step-specific inputs */}
            {step === 'property_type' && (
              <div className="flex flex-col gap-2">
                {PROPERTY_TYPE_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={state.property_type === opt}
                    onClick={() => setState((s) => ({ ...s, property_type: opt }))}
                  />
                ))}
              </div>
            )}

            {step === 'budget' && (
              <div className="flex flex-col gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={state.budget === opt}
                    onClick={() => setState((s) => ({ ...s, budget: opt }))}
                  />
                ))}
              </div>
            )}

            {step === 'wilaya' && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={state.wilaya}
                  onChange={(e) => setState((s) => ({ ...s, wilaya: e.target.value }))}
                  placeholder="Ex: Alger, Oran, Constantine…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[var(--agency-primary,#1a365d)] focus:outline-none focus:ring-2 focus:ring-[var(--agency-primary,#1a365d)]/20"
                  autoComplete="off"
                />
              </div>
            )}

            {step === 'contact' && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={state.contact_name}
                  onChange={(e) => setState((s) => ({ ...s, contact_name: e.target.value }))}
                  placeholder="Votre prénom et nom *"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[var(--agency-primary,#1a365d)] focus:outline-none focus:ring-2 focus:ring-[var(--agency-primary,#1a365d)]/20"
                  autoComplete="name"
                />
                <input
                  type="tel"
                  value={state.contact_phone}
                  onChange={(e) => setState((s) => ({ ...s, contact_phone: e.target.value }))}
                  placeholder="Téléphone (ex: 0555 123 456)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[var(--agency-primary,#1a365d)] focus:outline-none focus:ring-2 focus:ring-[var(--agency-primary,#1a365d)]/20"
                  autoComplete="tel"
                />
                <input
                  type="email"
                  value={state.contact_email}
                  onChange={(e) => setState((s) => ({ ...s, contact_email: e.target.value }))}
                  placeholder="Email (optionnel)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[var(--agency-primary,#1a365d)] focus:outline-none focus:ring-2 focus:ring-[var(--agency-primary,#1a365d)]/20"
                  autoComplete="email"
                />
                {error && (
                  <p className="text-xs text-red-600" role="alert">
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
                <p className="text-sm text-gray-600">
                  Nous avons bien reçu votre demande et vous contacterons dans les plus brefs délais.
                </p>
                <button
                  type="button"
                  onClick={() => { reset(); setOpen(false) }}
                  className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--agency-primary, #1a365d)' }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>

          {/* Footer CTA (skip for done) */}
          {step !== 'done' && (
            <div className="shrink-0 border-t border-gray-100 px-4 py-3">
              {isLastDataStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !state.contact_name.trim() || (!state.contact_phone.trim() && !state.contact_email.trim())}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--agency-primary, #1a365d)' }}
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : null}
                  {submitting ? 'Envoi…' : 'Envoyer ma demande'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={advance}
                  disabled={
                    (step === 'property_type' && !state.property_type) ||
                    (step === 'budget' && !state.budget) ||
                    (step === 'wilaya' && !state.wilaya.trim())
                  }
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'var(--agency-primary, #1a365d)' }}
                >
                  Suivant
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
