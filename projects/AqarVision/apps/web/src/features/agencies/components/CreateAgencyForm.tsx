"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WilayaCommuneAutocomplete } from "@/components/ui/WilayaCommuneAutocomplete";
import { slugify } from "@/lib/format";
import {
  createAgencyAction,
  checkSlugAction,
} from "@/features/agencies/actions/agency.action";

interface FormData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  wilayaCode: string;
  communeId: number | null;
}

interface FormErrors {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  location?: string;
  general?: string;
}

export function CreateAgencyForm() {
  const t = useTranslations("agency");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormData>({
    name: "",
    slug: "",
    email: "",
    phone: "",
    wilayaCode: "",
    communeId: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugEdited ? f.slug : slugify(name),
    }));
    setErrors((e) => ({ ...e, name: undefined }));

    if (!slugEdited) {
      const newSlug = slugify(name);
      if (newSlug.length >= 3) {
        checkSlugAvailability(newSlug);
      } else {
        setSlugAvailable(null);
      }
    }
  }

  function handleSlugChange(slug: string) {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, slug: cleanSlug }));
    setSlugEdited(true);
    setErrors((e) => ({ ...e, slug: undefined }));

    if (cleanSlug.length >= 3) {
      checkSlugAvailability(cleanSlug);
    } else {
      setSlugAvailable(null);
    }
  }

  async function checkSlugAvailability(slug: string) {
    setCheckingSlug(true);
    try {
      const result = await checkSlugAction(slug);
      if (result.success) {
        setSlugAvailable(result.data.available);
      }
    } finally {
      setCheckingSlug(false);
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (form.name.length < 3) {
      newErrors.name = t("errors.nameMin");
    }
    if (form.slug.length < 3) {
      newErrors.slug = t("errors.slugMin");
    }
    if (slugAvailable === false) {
      newErrors.slug = t("errors.slugTaken");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("errors.emailInvalid");
    }
    if (!/^(\+213|0)[5-7][0-9]{8}$/.test(form.phone)) {
      newErrors.phone = t("errors.phoneInvalid");
    }
    if (!form.wilayaCode || !form.communeId) {
      newErrors.location = t("errors.locationRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const result = await createAgencyAction({
        name: form.name,
        slug: form.slug,
        email: form.email,
        phone: form.phone,
        wilaya_code: form.wilayaCode,
        commune_id: form.communeId!,
      });

      if (result.success) {
        router.push("/AqarPro/dashboard");
      } else {
        setErrors({ general: result.message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">{errors.general}</p>
        </div>
      )}

      <Input
        label={t("form.name")}
        value={form.name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder={t("form.namePlaceholder")}
        error={errors.name}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label={t("form.slug")}
          value={form.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="mon-agence"
          error={errors.slug}
          helperText={
            checkingSlug
              ? t("form.slugChecking")
              : slugAvailable === true
                ? t("form.slugAvailable")
                : slugAvailable === false
                  ? t("form.slugTaken")
                  : t("form.slugHelp")
          }
        />
        {slugAvailable !== null && !checkingSlug && (
          <div
            className={cn(
              "text-xs",
              slugAvailable
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {slugAvailable ? t("form.slugAvailable") : t("form.slugTaken")}
          </div>
        )}
      </div>

      <Input
        label={t("form.email")}
        type="email"
        value={form.email}
        onChange={(e) => {
          setForm((f) => ({ ...f, email: e.target.value }));
          setErrors((e_) => ({ ...e_, email: undefined }));
        }}
        placeholder="contact@agence.dz"
        error={errors.email}
      />

      <Input
        label={t("form.phone")}
        type="tel"
        value={form.phone}
        onChange={(e) => {
          setForm((f) => ({ ...f, phone: e.target.value }));
          setErrors((e_) => ({ ...e_, phone: undefined }));
        }}
        placeholder="0555123456"
        error={errors.phone}
      />

      <div>
        <WilayaCommuneAutocomplete
          onSelect={(wilayaCode, communeId) => {
            setForm((f) => ({ ...f, wilayaCode, communeId }));
            setErrors((e) => ({ ...e, location: undefined }));
          }}
          wilayaLabel={t("form.wilaya")}
          communeLabel={t("form.commune")}
        />
        {errors.location && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
            {errors.location}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isPending}
        >
          <Building2 size={18} />
          {t("form.submit")}
        </Button>
      </div>

      <p className="text-xs text-center text-stone-500 dark:text-stone-400">
        {t("form.trialNote")}
      </p>
    </form>
  );
}
