"use client";

import { useState } from "react";
import {
  Building2,
  DollarSign,
  Home,
  Hotel,
  Landmark,
  MapPin,
  Star,
  Store,
  Tractor,
  Warehouse,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WilayaCommuneAutocomplete } from "@/components/ui/WilayaCommuneAutocomplete";
import type { ListingType, PropertyType } from "@/features/listings/schemas/listing.schema";
import Link from "next/link";

// ---------------------------------------------------------------------------
// This component implements the /deposer deferred auth pattern:
// Steps 1-2 are accessible WITHOUT login (data saved to localStorage).
// Step 3 prompts for auth. After auth, user is redirected to the
// appropriate wizard (AqarPro or AqarChaab) with data pre-filled.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "aqar-wizard-draft";

const LISTING_TYPES: { value: ListingType; label: string; icon: typeof Home }[] = [
  { value: "sale", label: "Vente", icon: DollarSign },
  { value: "rent", label: "Location", icon: Home },
  { value: "vacation", label: "Vacances", icon: Star },
];

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: typeof Home }[] = [
  { value: "apartment", label: "Appartement", icon: Building2 },
  { value: "villa", label: "Villa", icon: Home },
  { value: "terrain", label: "Terrain", icon: MapPin },
  { value: "commercial", label: "Local commercial", icon: Store },
  { value: "office", label: "Bureau", icon: Landmark },
  { value: "building", label: "Immeuble", icon: Hotel },
  { value: "farm", label: "Ferme", icon: Tractor },
  { value: "warehouse", label: "Entrepôt", icon: Warehouse },
];

interface DraftData {
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  wilayaCode: string;
  communeId: number;
  address: string;
}

function RadioCard<T extends string>({
  value,
  selected,
  onSelect,
  label,
  icon: Icon,
}: {
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
  label: string;
  icon: typeof Home;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
        selected
          ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/50"
          : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600"
      )}
    >
      <Icon
        size={24}
        className={cn(
          selected
            ? "text-teal-600 dark:text-teal-400"
            : "text-stone-400 dark:text-stone-500"
        )}
      />
      <span
        className={cn(
          "text-sm font-medium",
          selected
            ? "text-teal-700 dark:text-teal-300"
            : "text-stone-700 dark:text-stone-300"
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function DeferredAuthDeposer() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DraftData>({
    listingType: null,
    propertyType: null,
    wilayaCode: "",
    communeId: 0,
    address: "",
  });

  // Save to localStorage on every change
  function updateData(partial: Partial<DraftData>) {
    const next = { ...data, ...partial };
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable
    }
  }

  function canProceedStep0(): boolean {
    return !!data.listingType && !!data.propertyType;
  }

  function canProceedStep1(): boolean {
    return !!data.wilayaCode && !!data.communeId;
  }

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className="h-full rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-normal"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        {/* Step 1: Type & Category */}
        {step === 0 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Quel type de transaction ?
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Pas besoin de compte pour commencer.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {LISTING_TYPES.map((opt) => (
                <RadioCard
                  key={opt.value}
                  value={opt.value}
                  selected={data.listingType === opt.value}
                  onSelect={(v) => updateData({ listingType: v })}
                  label={opt.label}
                  icon={opt.icon}
                />
              ))}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                Type de bien
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PROPERTY_TYPES.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    value={opt.value}
                    selected={data.propertyType === opt.value}
                    onSelect={(v) => updateData({ propertyType: v })}
                    label={opt.label}
                    icon={opt.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Où se situe votre bien ?
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Toujours sans inscription.
              </p>
            </div>

            <WilayaCommuneAutocomplete
              onSelect={(wilayaCode, communeId) =>
                updateData({ wilayaCode, communeId })
              }
              defaultWilaya={data.wilayaCode || undefined}
              defaultCommune={data.communeId || undefined}
            />

            <Input
              label="Adresse (optionnel)"
              placeholder="Rue, quartier..."
              value={data.address}
              onChange={(e) => updateData({ address: e.target.value })}
            />
          </div>
        )}

        {/* Step 3: Auth prompt */}
        {step === 2 && (
          <div className="space-y-6 text-center py-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950 mx-auto">
              <LogIn size={28} className="text-teal-600 dark:text-teal-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Connectez-vous pour continuer
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 max-w-sm mx-auto">
                Vos informations sont sauvegardées. Connectez-vous ou inscrivez-vous
                pour finaliser votre annonce.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/auth/signup?redirect=/deposer">
                <Button variant="primary" size="lg">
                  <UserPlus size={18} />
                  Créer un compte
                </Button>
              </Link>
              <Link href="/auth/login?redirect=/deposer">
                <Button variant="secondary" size="lg">
                  <LogIn size={18} />
                  Déjà un compte ? Se connecter
                </Button>
              </Link>
            </div>

            <p className="text-xs text-stone-400 dark:text-stone-500">
              Vos données seront restaurées automatiquement.
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 2 && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Précédent
          </Button>
          <Button
            variant="primary"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 ? !canProceedStep0() : !canProceedStep1()}
          >
            Suivant
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => setStep(1)}>
            Précédent
          </Button>
        </div>
      )}
    </div>
  );
}
