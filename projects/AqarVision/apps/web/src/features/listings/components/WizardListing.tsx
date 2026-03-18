"use client";

import {
  type ReactNode,
  useEffect,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle,
  DollarSign,
  FileText,
  GripVertical,
  Home,
  Hotel,
  Landmark,
  Languages,
  Loader2,
  MapPin,
  Package,
  Sparkles,
  Star,
  Store,
  Tractor,
  Trash2,
  Upload,
  Warehouse,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DocumentUpload, type UploadedDoc } from "@/components/ui/DocumentUpload";
import { WilayaCommuneAutocomplete } from "@/components/ui/WilayaCommuneAutocomplete";
import {
  generateListingTitle,
  generateListingDescription,
} from "@/features/listings/utils/generate-listing-text";
import type {
  ListingType,
  PropertyType,
} from "@/features/listings/schemas/listing.schema";
import type { ListingDetails } from "@/features/listings/types/listing.types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WizardMode =
  | { type: "agency"; agencyId: string }
  | { type: "individual"; userId: string };

interface WizardListingProps {
  mode: WizardMode;
  listingId?: string;
  onSaveDraft?: (id: string | null, data: Partial<WizardState>) => Promise<{ listingId: string }>;
  onPublish?: (data: WizardState) => Promise<void>;
  maxPhotos?: number;
}

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  isCover: boolean;
}

interface TranslationEntry {
  locale: "fr" | "ar" | "en" | "es";
  title: string;
  description: string;
  slug: string;
}

export interface WizardState {
  listingType: ListingType | null;
  propertyType: PropertyType | null;
  wilayaCode: string;
  communeId: number;
  wilayaName: string;
  communeName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  details: Partial<ListingDetails>;
  contactPhone: string;
  showPhone: boolean;
  acceptMessages: boolean;
  translations: TranslationEntry[];
  photos: PhotoFile[];
  documents: UploadedDoc[];
  price: number | null;
  currency: "DZD" | "EUR";
  version: number;
}

type WizardAction =
  | { type: "SET_LISTING_TYPE"; payload: ListingType }
  | { type: "SET_PROPERTY_TYPE"; payload: PropertyType }
  | { type: "SET_LOCATION"; payload: { wilayaCode: string; communeId: number; wilayaName: string; communeName: string } }
  | { type: "SET_ADDRESS"; payload: string }
  | { type: "SET_DETAILS"; payload: Partial<ListingDetails> }
  | { type: "SET_CONTACT"; payload: { contactPhone?: string; showPhone?: boolean; acceptMessages?: boolean } }
  | { type: "SET_TRANSLATION"; payload: TranslationEntry }
  | { type: "ADD_PHOTO"; payload: PhotoFile }
  | { type: "REMOVE_PHOTO"; payload: string }
  | { type: "SET_COVER"; payload: string }
  | { type: "REORDER_PHOTOS"; payload: PhotoFile[] }
  | { type: "ADD_DOCUMENT"; payload: UploadedDoc }
  | { type: "REMOVE_DOCUMENT"; payload: string }
  | { type: "TOGGLE_DOC_PUBLIC"; payload: string }
  | { type: "SET_PRICE"; payload: number | null }
  | { type: "SET_CURRENCY"; payload: "DZD" | "EUR" }
  | { type: "RESTORE"; payload: WizardState };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string; icon: typeof Home }[] = [
  { value: "sale", label: "Vente", icon: DollarSign },
  { value: "rent", label: "Location", icon: Home },
  { value: "vacation", label: "Vacances", icon: Star },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string; icon: typeof Home }[] = [
  { value: "apartment", label: "Appartement", icon: Building2 },
  { value: "villa", label: "Villa", icon: Home },
  { value: "terrain", label: "Terrain", icon: MapPin },
  { value: "commercial", label: "Local commercial", icon: Store },
  { value: "office", label: "Bureau", icon: Landmark },
  { value: "building", label: "Immeuble", icon: Hotel },
  { value: "farm", label: "Ferme", icon: Tractor },
  { value: "warehouse", label: "Entrepôt", icon: Warehouse },
];

const FEATURE_KEYS: (keyof ListingDetails)[] = [
  "has_parking",
  "has_elevator",
  "has_balcony",
  "has_pool",
  "has_garden",
  "furnished",
  "has_sea_view",
  "has_water",
  "has_electricity",
];

const FEATURE_LABELS: Record<string, string> = {
  has_parking: "Parking",
  has_elevator: "Ascenseur",
  has_balcony: "Balcon",
  has_pool: "Piscine",
  has_garden: "Jardin",
  furnished: "Meublé",
  has_sea_view: "Vue mer",
  has_water: "Eau",
  has_electricity: "Électricité",
};

const LOCALES = ["fr", "ar", "en", "es"] as const;
const LOCALE_LABELS: Record<string, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
  es: "Español",
};

const STORAGE_KEY = "aqar-wizard-draft";

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function getInitialState(): WizardState {
  return {
    listingType: null,
    propertyType: null,
    wilayaCode: "",
    communeId: 0,
    wilayaName: "",
    communeName: "",
    address: "",
    latitude: null,
    longitude: null,
    details: {},
    contactPhone: "",
    showPhone: true,
    acceptMessages: true,
    translations: [{ locale: "fr", title: "", description: "", slug: "" }],
    photos: [],
    documents: [],
    price: null,
    currency: "DZD",
    version: 0,
  };
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_LISTING_TYPE":
      return { ...state, listingType: action.payload };
    case "SET_PROPERTY_TYPE":
      return { ...state, propertyType: action.payload };
    case "SET_LOCATION":
      return {
        ...state,
        wilayaCode: action.payload.wilayaCode,
        communeId: action.payload.communeId,
        wilayaName: action.payload.wilayaName,
        communeName: action.payload.communeName,
      };
    case "SET_ADDRESS":
      return { ...state, address: action.payload };
    case "SET_DETAILS":
      return { ...state, details: { ...state.details, ...action.payload } };
    case "SET_CONTACT": {
      const next = { ...state };
      if (action.payload.contactPhone !== undefined) next.contactPhone = action.payload.contactPhone;
      if (action.payload.showPhone !== undefined) next.showPhone = action.payload.showPhone;
      if (action.payload.acceptMessages !== undefined) next.acceptMessages = action.payload.acceptMessages;
      return next;
    }
    case "SET_TRANSLATION": {
      const existing = state.translations.findIndex(
        (t) => t.locale === action.payload.locale
      );
      const translations = [...state.translations];
      if (existing >= 0) {
        translations[existing] = action.payload;
      } else {
        translations.push(action.payload);
      }
      return { ...state, translations };
    }
    case "ADD_PHOTO": {
      const photos = [...state.photos, action.payload];
      if (photos.length === 1) {
        photos[0] = { ...photos[0]!, isCover: true };
      }
      return { ...state, photos };
    }
    case "REMOVE_PHOTO": {
      const photos = state.photos.filter((p) => p.id !== action.payload);
      if (photos.length > 0 && !photos.some((p) => p.isCover)) {
        photos[0] = { ...photos[0]!, isCover: true };
      }
      return { ...state, photos };
    }
    case "SET_COVER":
      return {
        ...state,
        photos: state.photos.map((p) => ({
          ...p,
          isCover: p.id === action.payload,
        })),
      };
    case "REORDER_PHOTOS":
      return { ...state, photos: action.payload };
    case "ADD_DOCUMENT":
      return { ...state, documents: [...state.documents, action.payload] };
    case "REMOVE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.filter((d) => d.id !== action.payload),
      };
    case "TOGGLE_DOC_PUBLIC":
      return {
        ...state,
        documents: state.documents.map((d) =>
          d.id === action.payload ? { ...d, is_public: !d.is_public } : d
        ),
      };
    case "SET_PRICE":
      return { ...state, price: action.payload };
    case "SET_CURRENCY":
      return { ...state, currency: action.payload };
    case "RESTORE":
      return action.payload;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-700">
        <div
          className="h-full rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-normal"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === "saving" && (
        <>
          <Loader2 size={12} className="animate-spin text-stone-400 dark:text-stone-500" />
          <span className="text-stone-500 dark:text-stone-400">Sauvegarde...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400">Sauvegardé</span>
        </>
      )}
      {status === "error" && (
        <span className="text-red-600 dark:text-red-400">Erreur de sauvegarde</span>
      )}
    </div>
  );
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

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function StepType({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Type de transaction
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Quel type d'annonce souhaitez-vous publier ?
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {LISTING_TYPE_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.value}
            value={opt.value}
            selected={state.listingType === opt.value}
            onSelect={(v) => dispatch({ type: "SET_LISTING_TYPE", payload: v })}
            label={opt.label}
            icon={opt.icon}
          />
        ))}
      </div>
    </div>
  );
}

function StepCategory({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Type de bien
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Sélectionnez la catégorie de votre bien.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROPERTY_TYPE_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.value}
            value={opt.value}
            selected={state.propertyType === opt.value}
            onSelect={(v) => dispatch({ type: "SET_PROPERTY_TYPE", payload: v })}
            label={opt.label}
            icon={opt.icon}
          />
        ))}
      </div>
    </div>
  );
}

function StepLocation({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Localisation
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Où se situe votre bien ?
        </p>
      </div>
      <WilayaCommuneAutocomplete
        onSelect={(wilayaCode, communeId) =>
          dispatch({
            type: "SET_LOCATION",
            payload: { wilayaCode, communeId, wilayaName: wilayaCode, communeName: String(communeId) },
          })
        }
        defaultWilaya={state.wilayaCode || undefined}
        defaultCommune={state.communeId || undefined}
      />
      <Input
        label="Adresse"
        placeholder="Rue, quartier..."
        value={state.address}
        onChange={(e) => dispatch({ type: "SET_ADDRESS", payload: e.target.value })}
      />
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 h-48 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={24} className="mx-auto text-stone-400 dark:text-stone-500 mb-2" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Position sur la carte (optionnel)
          </p>
        </div>
      </div>
    </div>
  );
}

function StepDetails({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  const d = state.details;

  function setDetail(key: keyof ListingDetails, value: number | boolean | undefined) {
    dispatch({ type: "SET_DETAILS", payload: { [key]: value } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Détails du bien
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Surface (m²)"
          type="number"
          min={1}
          value={d.area_m2 ?? ""}
          onChange={(e) => setDetail("area_m2", e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Pièces"
          type="number"
          min={0}
          value={d.rooms ?? ""}
          onChange={(e) => setDetail("rooms", e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Salles de bain"
          type="number"
          min={0}
          value={d.bathrooms ?? ""}
          onChange={(e) => setDetail("bathrooms", e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Étage"
          type="number"
          min={0}
          value={d.floor ?? ""}
          onChange={(e) => setDetail("floor", e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Étages total"
          type="number"
          min={0}
          value={d.total_floors ?? ""}
          onChange={(e) => setDetail("total_floors", e.target.value ? Number(e.target.value) : undefined)}
        />
        <Input
          label="Année de construction"
          type="number"
          min={1900}
          max={2030}
          value={d.year_built ?? ""}
          onChange={(e) => setDetail("year_built", e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
          Équipements
        </p>
        <div className="flex flex-wrap gap-2">
          {FEATURE_KEYS.map((key) => {
            const active = !!d[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDetail(key, !active)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-fast",
                  "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
                  active
                    ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                    : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500"
                )}
              >
                {active && <Check size={14} className="inline me-1" />}
                {FEATURE_LABELS[key]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-700">
        <Input
          label="Téléphone de contact"
          type="tel"
          placeholder="+213 5XX XXX XXX"
          value={state.contactPhone}
          onChange={(e) =>
            dispatch({ type: "SET_CONTACT", payload: { contactPhone: e.target.value } })
          }
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.showPhone}
            onChange={(e) =>
              dispatch({ type: "SET_CONTACT", payload: { showPhone: e.target.checked } })
            }
            className="rounded border-stone-300 dark:border-stone-600 text-teal-600 dark:text-teal-400 focus:ring-teal-600 dark:focus:ring-teal-400"
          />
          <span className="text-sm text-stone-700 dark:text-stone-300">
            Afficher le téléphone
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.acceptMessages}
            onChange={(e) =>
              dispatch({
                type: "SET_CONTACT",
                payload: { acceptMessages: e.target.checked },
              })
            }
            className="rounded border-stone-300 dark:border-stone-600 text-teal-600 dark:text-teal-400 focus:ring-teal-600 dark:focus:ring-teal-400"
          />
          <span className="text-sm text-stone-700 dark:text-stone-300">
            Accepter les messages
          </span>
        </label>
      </div>
    </div>
  );
}

function StepDescription({
  state,
  dispatch,
  locales,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  locales: readonly ("fr" | "ar" | "en" | "es")[];
}) {
  const [activeLocale, setActiveLocale] = useState<"fr" | "ar" | "en" | "es">("fr");

  const current = state.translations.find((t) => t.locale === activeLocale) ?? {
    locale: activeLocale,
    title: "",
    description: "",
    slug: "",
  };

  function updateField(field: "title" | "description", value: string) {
    const slug =
      field === "title"
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 80)
        : current.slug;

    dispatch({
      type: "SET_TRANSLATION",
      payload: {
        ...current,
        [field]: value,
        slug: field === "title" ? slug : current.slug,
      },
    });
  }

  function handleGenerate() {
    if (!state.propertyType || !state.listingType) return;
    const input = {
      listingType: state.listingType,
      propertyType: state.propertyType,
      details: state.details,
      wilayaName: state.wilayaName,
      communeName: state.communeName,
      price: state.price ?? undefined,
      currency: state.currency,
    };
    const title = generateListingTitle(input);
    const description = generateListingDescription(input);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
    dispatch({
      type: "SET_TRANSLATION",
      payload: { locale: activeLocale, title, description, slug },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Description
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            FR obligatoire, autres optionnels.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerate}
          disabled={!state.propertyType || !state.listingType}
        >
          <Sparkles size={14} />
          Générer
        </Button>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 p-1">
        {locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => setActiveLocale(loc)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-fast",
              activeLocale === loc
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            {LOCALE_LABELS[loc]}
            {loc === "fr" && <span className="text-red-500 dark:text-red-400 ms-0.5">*</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <Input
          label="Titre"
          placeholder="Ex: Appartement F3 lumineux à Hydra"
          value={current.title}
          onChange={(e) => updateField("title", e.target.value)}
          helperText={`${current.title.length}/120`}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Description
          </label>
          <textarea
            value={current.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={6}
            placeholder="Décrivez votre bien en détail..."
            className={cn(
              "w-full rounded-md border border-stone-300 dark:border-stone-600",
              "bg-white dark:bg-stone-950 px-3 py-2",
              "text-sm text-stone-900 dark:text-stone-100",
              "placeholder:text-stone-400 dark:placeholder:text-stone-500",
              "transition-colors duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-stone-950"
            )}
          />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {current.description.length}/5000
          </p>
        </div>
        <Input
          label="Slug"
          value={current.slug}
          onChange={(e) =>
            dispatch({
              type: "SET_TRANSLATION",
              payload: { ...current, slug: e.target.value },
            })
          }
          helperText="URL de l'annonce (auto-généré)"
        />
      </div>
    </div>
  );
}

function StepPhotos({
  state,
  dispatch,
  maxPhotos,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  maxPhotos: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      if (state.photos.length + i >= maxPhotos) {
        setError(`Maximum ${maxPhotos} photos autorisées.`);
        break;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Photo trop volumineuse. Maximum : 10 MB.");
        continue;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format non accepté. JPG, PNG ou WebP uniquement.");
        continue;
      }
      dispatch({
        type: "ADD_PHOTO",
        payload: {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          isCover: false,
        },
      });
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Photos
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {state.photos.length}/{maxPhotos} photos. Minimum 1, cliquez sur une photo pour la
          choisir comme couverture.
        </p>
      </div>

      {/* Upload zone */}
      {state.photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8",
            "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900",
            "hover:border-stone-400 dark:hover:border-stone-600 transition-colors duration-fast",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
          )}
        >
          <Camera size={24} className="text-stone-400 dark:text-stone-500" />
          <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Ajouter des photos
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            JPG, PNG, WebP — max 10 MB
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Photo grid */}
      {state.photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {state.photos.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 group cursor-pointer",
                photo.isCover
                  ? "border-teal-600 dark:border-teal-400"
                  : "border-transparent hover:border-stone-300 dark:hover:border-stone-600"
              )}
              onClick={() => dispatch({ type: "SET_COVER", payload: photo.id })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt=""
                className="w-full h-full object-cover"
              />
              {photo.isCover && (
                <span className="absolute top-1.5 start-1.5 rounded bg-teal-600 dark:bg-teal-500 px-1.5 py-0.5 text-2xs font-medium text-white">
                  Couverture
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "REMOVE_PHOTO", payload: photo.id });
                }}
                className={cn(
                  "absolute top-1.5 end-1.5 rounded-full p-1",
                  "bg-black/50 text-white opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-fast",
                  "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                )}
                aria-label="Supprimer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepPhotosAndDocs({
  state,
  dispatch,
  maxPhotos,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  maxPhotos: number;
}) {
  return (
    <div className="space-y-8">
      <StepPhotos state={state} dispatch={dispatch} maxPhotos={maxPhotos} />

      <div className="border-t border-stone-200 dark:border-stone-700 pt-8">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
          Documents légaux
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
          Acte, livret foncier, promesse de vente, etc.
        </p>
        <DocumentUpload
          documents={state.documents}
          onUpload={(file) =>
            dispatch({
              type: "ADD_DOCUMENT",
              payload: {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                is_public: false,
              },
            })
          }
          onRemove={(id) => dispatch({ type: "REMOVE_DOCUMENT", payload: id })}
          onTogglePublic={(id) => dispatch({ type: "TOGGLE_DOC_PUBLIC", payload: id })}
        />
      </div>
    </div>
  );
}

function StepPrice({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          Prix et récapitulatif
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prix"
          type="number"
          min={1}
          placeholder="Ex: 15000000"
          value={state.price ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_PRICE",
              payload: e.target.value ? Number(e.target.value) : null,
            })
          }
        />
        <Select
          label="Devise"
          value={state.currency}
          onChange={(e) =>
            dispatch({
              type: "SET_CURRENCY",
              payload: e.target.value as "DZD" | "EUR",
            })
          }
          options={[
            { value: "DZD", label: "DZD" },
            { value: "EUR", label: "EUR" },
          ]}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Récapitulatif
        </h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Type</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.listingType
                ? LISTING_TYPE_OPTIONS.find((o) => o.value === state.listingType)?.label
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Bien</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.propertyType
                ? PROPERTY_TYPE_OPTIONS.find((o) => o.value === state.propertyType)?.label
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Localisation</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.wilayaCode && state.communeId
                ? `${state.communeName}, ${state.wilayaName}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Surface</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.details.area_m2 ? `${state.details.area_m2} m²` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Pièces</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.details.rooms ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Photos</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100">
              {state.photos.length}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500 dark:text-stone-400">Titre (FR)</dt>
            <dd className="font-medium text-stone-900 dark:text-stone-100 truncate max-w-[200px]">
              {state.translations.find((t) => t.locale === "fr")?.title || "—"}
            </dd>
          </div>
          {state.price && (
            <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
              <dt className="text-stone-700 dark:text-stone-300 font-semibold">Prix</dt>
              <dd className="font-bold text-teal-700 dark:text-teal-400">
                {new Intl.NumberFormat("fr-DZ").format(state.price)} {state.currency}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

// Combined step for individual mode: What & Where
function StepWhatWhere({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-8">
      <StepType state={state} dispatch={dispatch} />
      <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
        <StepCategory state={state} dispatch={dispatch} />
      </div>
      <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
        <StepLocation state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}

// Combined step for individual mode: Details & Description
function StepDetailsDescription({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  return (
    <div className="space-y-8">
      <StepDetails state={state} dispatch={dispatch} />
      <div className="border-t border-stone-200 dark:border-stone-700 pt-6">
        <StepDescription state={state} dispatch={dispatch} locales={["fr"]} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

export function WizardListing({
  mode,
  listingId: initialListingId,
  onSaveDraft,
  onPublish,
  maxPhotos = 10,
}: WizardListingProps) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, getInitialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [listingId, setListingId] = useState<string | null>(initialListingId ?? null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAgency = mode.type === "agency";

  const AGENCY_STEP_LABELS = [
    "Type",
    "Catégorie",
    "Localisation",
    "Détails",
    "Description",
    "Photos & Docs",
    "Prix",
  ];
  const INDIVIDUAL_STEP_LABELS = [
    "Quoi & Où",
    "Détails & Description",
    "Photos",
    "Prix",
  ];

  const stepLabels = isAgency ? AGENCY_STEP_LABELS : INDIVIDUAL_STEP_LABELS;
  const totalSteps = stepLabels.length;

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WizardState;
        // Skip photos (File objects can't be serialized)
        dispatch({ type: "RESTORE", payload: { ...parsed, photos: [], documents: [] } });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    try {
      const toSave = { ...state, photos: [], documents: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Storage full or unavailable
    }
  }, [state]);

  // Auto-save debounce 3s to server (agency mode only)
  useEffect(() => {
    if (!isAgency || !onSaveDraft) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSaveStatus("saving");
      startTransition(async () => {
        try {
          const result = await onSaveDraft(listingId, state);
          setListingId(result.listingId);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 3000);
        } catch {
          setSaveStatus("error");
        }
      });
    }, 3000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state, isAgency, onSaveDraft, listingId]);

  function canGoNext(): boolean {
    if (isAgency) {
      switch (currentStep) {
        case 0: return !!state.listingType;
        case 1: return !!state.propertyType;
        case 2: return !!state.wilayaCode && !!state.communeId;
        case 3: return !!state.details.area_m2;
        case 4: {
          const fr = state.translations.find((t) => t.locale === "fr");
          return !!fr && fr.title.length >= 10 && fr.description.length >= 50;
        }
        case 5: return state.photos.length >= 1;
        case 6: return !!state.price && state.price > 0;
        default: return false;
      }
    } else {
      switch (currentStep) {
        case 0: return !!state.listingType && !!state.propertyType && !!state.wilayaCode && !!state.communeId;
        case 1: {
          const fr = state.translations.find((t) => t.locale === "fr");
          return !!state.details.area_m2 && !!fr && fr.title.length >= 10;
        }
        case 2: return state.photos.length >= 1;
        case 3: return !!state.price && state.price > 0;
        default: return false;
      }
    }
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handlePublish() {
    if (!onPublish) return;
    startTransition(async () => {
      try {
        await onPublish(state);
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Error handled upstream
      }
    });
  }

  function handleSaveDraftClick() {
    if (!onSaveDraft) return;
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const result = await onSaveDraft(listingId, state);
        setListingId(result.listingId);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("error");
      }
    });
  }

  function renderStep(): ReactNode {
    if (isAgency) {
      switch (currentStep) {
        case 0: return <StepType state={state} dispatch={dispatch} />;
        case 1: return <StepCategory state={state} dispatch={dispatch} />;
        case 2: return <StepLocation state={state} dispatch={dispatch} />;
        case 3: return <StepDetails state={state} dispatch={dispatch} />;
        case 4: return <StepDescription state={state} dispatch={dispatch} locales={LOCALES} />;
        case 5: return <StepPhotosAndDocs state={state} dispatch={dispatch} maxPhotos={maxPhotos} />;
        case 6: return <StepPrice state={state} dispatch={dispatch} />;
        default: return null;
      }
    } else {
      switch (currentStep) {
        case 0: return <StepWhatWhere state={state} dispatch={dispatch} />;
        case 1: return <StepDetailsDescription state={state} dispatch={dispatch} />;
        case 2: return <StepPhotos state={state} dispatch={dispatch} maxPhotos={maxPhotos} />;
        case 3: return <StepPrice state={state} dispatch={dispatch} />;
        default: return null;
      }
    }
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between gap-4">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Step labels (desktop) */}
      <div className="hidden sm:flex items-center gap-1 text-xs">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            {i > 0 && (
              <div className="w-4 h-px bg-stone-300 dark:bg-stone-600" />
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5",
                i === currentStep
                  ? "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-medium"
                  : i < currentStep
                  ? "text-teal-600 dark:text-teal-500"
                  : "text-stone-400 dark:text-stone-500"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft size={16} />
          Précédent
        </Button>

        <div className="flex items-center gap-3">
          {isLastStep && (
            <Button
              variant="outline"
              onClick={handleSaveDraftClick}
              loading={isPending && saveStatus === "saving"}
              disabled={isPending}
            >
              Brouillon
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={!canGoNext() || isPending}
              loading={isPending && saveStatus !== "saving"}
            >
              Publier
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Suivant
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
