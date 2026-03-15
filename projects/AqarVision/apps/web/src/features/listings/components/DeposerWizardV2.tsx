"use client";

import { useState } from "react";
import { WizardStepper } from "./deposer/WizardStepper";
import { StepType } from "./deposer/StepType";
import { StepLocation } from "./deposer/StepLocation";
import { StepPriceSurface } from "./deposer/StepPriceSurface";
import { StepDetails } from "./deposer/StepDetails";
import { StepDescription } from "./deposer/StepDescription";
import { StepPhotos } from "./deposer/StepPhotos";
import { StepRecap } from "./deposer/StepRecap";
import { INITIAL_WIZARD_STATE, type WizardState } from "./deposer/wizard-state";

interface DeposerWizardV2Props {
  wilayas: { code: string; name: string }[];
  activeCount: number;
  quota: number;
  locale: string;
}

const SECTION = "rounded-xl border border-zinc-200 bg-white p-6 shadow-xs";

export function DeposerWizardV2({ wilayas, activeCount, quota, locale }: DeposerWizardV2Props) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);

  function patch(update: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...update }));
  }

  const STEPS = [
    <StepType key="type" state={state} onChange={patch} onNext={() => setStep(1)} />,
    <StepLocation
      key="location"
      state={state}
      onChange={patch}
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
      wilayas={wilayas}
    />,
    <StepPriceSurface
      key="price"
      state={state}
      onChange={patch}
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
    />,
    <StepDetails
      key="details"
      state={state}
      onChange={patch}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />,
    <StepDescription
      key="description"
      state={state}
      onChange={patch}
      onNext={() => setStep(5)}
      onBack={() => setStep(3)}
    />,
    <StepPhotos
      key="photos"
      state={state}
      onChange={patch}
      onNext={() => setStep(6)}
      onBack={() => setStep(4)}
    />,
    <StepRecap
      key="recap"
      state={state}
      onChange={patch}
      onBack={() => setStep(5)}
      locale={locale}
      activeCount={activeCount}
      quota={quota}
    />,
  ];

  return (
    <div>
      <WizardStepper current={step} />
      <div className={SECTION}>{STEPS[step]}</div>
    </div>
  );
}
