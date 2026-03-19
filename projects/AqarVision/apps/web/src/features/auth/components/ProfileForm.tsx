"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Phone, User, Globe, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input, Select } from "@/components/ui";
import { updateProfileSchema } from "@/features/auth/schemas/auth.schema";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  preferredLocale: "fr" | "ar" | "en" | "es";
}

interface ProfileFormProps {
  initialData: ProfileData;
  showDeleteAccount?: boolean;
  onProfileUpdate?: (data: ProfileData) => void;
}

const localeOptions = [
  { value: "fr", label: "Fran\u00e7ais" },
  { value: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  { value: "en", label: "English" },
  { value: "es", label: "Espa\u00f1ol" },
];

export function ProfileForm({
  initialData,
  showDeleteAccount = false,
  onProfileUpdate,
}: ProfileFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  // Profile fields
  const [fields, setFields] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    phone: initialData.phone,
    preferredLocale: initialData.preferredLocale,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password fields
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordGlobalError, setPasswordGlobalError] = useState<string | null>(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function updateField(name: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    setProfileSuccess(false);
    if (profileErrors[name]) {
      setProfileErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleProfileSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess(false);

    const parsed = updateProfileSchema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.errors) {
        const key = err.path[0]?.toString();
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = err.message;
        }
      }
      setProfileErrors(fieldErrors);
      return;
    }

    setProfileLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
          preferred_locale: parsed.data.preferredLocale,
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");

      if (error) {
        setProfileErrors({ _global: t("profile.updateError") });
        return;
      }

      setProfileSuccess(true);
      onProfileUpdate?.({
        ...initialData,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        preferredLocale: parsed.data.preferredLocale as ProfileData["preferredLocale"],
      });
    } catch {
      setProfileErrors({ _global: t("profile.updateError") });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    setPasswordGlobalError(null);

    const errs: Record<string, string> = {};
    if (!passwordFields.oldPassword) {
      errs.oldPassword = t("fields.required");
    }
    if (passwordFields.newPassword.length < 8) {
      errs.newPassword = t("fields.passwordMinLength");
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      errs.confirmPassword = t("fields.passwordMismatch");
    }
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setPasswordLoading(true);
    try {
      const supabase = createClient();

      // Verify old password by signing in
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) {
        setPasswordGlobalError(t("profile.passwordError"));
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordFields.oldPassword,
      });

      if (signInError) {
        setPasswordErrors({ oldPassword: t("profile.wrongPassword") });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordFields.newPassword,
      });

      if (error) {
        setPasswordGlobalError(t("profile.passwordError"));
        return;
      }

      setPasswordSuccess(true);
      setPasswordFields({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPasswordGlobalError(t("profile.passwordError"));
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") return;

    setDeleteLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Account deletion would be handled by an admin or edge function
      // For now, sign out the user
      window.location.href = "/";
    } catch {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Personal Info Section */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
          {t("profile.personalInfo")}
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
          {profileErrors._global && (
            <div
              className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
              role="alert"
            >
              {profileErrors._global}
            </div>
          )}

          {profileSuccess && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {t("profile.updateSuccess")}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={tCommon("labels.firstName")}
              type="text"
              autoComplete="given-name"
              value={fields.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              startIcon={<User size={16} />}
              error={profileErrors.firstName}
              disabled={profileLoading}
              required
            />
            <Input
              label={tCommon("labels.lastName")}
              type="text"
              autoComplete="family-name"
              value={fields.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              startIcon={<User size={16} />}
              error={profileErrors.lastName}
              disabled={profileLoading}
              required
            />
          </div>

          <Input
            label={t("fields.email")}
            type="email"
            value={initialData.email}
            disabled
            helperText={t("profile.emailReadonly")}
          />

          <Input
            label={tCommon("labels.phone")}
            type="tel"
            autoComplete="tel"
            placeholder="+213 5XX XXX XXX"
            value={fields.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            startIcon={<Phone size={16} />}
            error={profileErrors.phone}
            disabled={profileLoading}
            required
          />

          <Select
            label={t("profile.language")}
            options={localeOptions}
            value={fields.preferredLocale}
            onChange={(e) => updateField("preferredLocale", e.target.value)}
            disabled={profileLoading}
          />

          <Button
            type="submit"
            loading={profileLoading}
          >
            {tCommon("buttons.save")}
          </Button>
        </form>
      </section>

      {/* Divider */}
      <hr className="border-stone-200 dark:border-stone-700" />

      {/* Password Section */}
      <section>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
          {t("profile.changePassword")}
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          {passwordGlobalError && (
            <div
              className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
              role="alert"
            >
              {passwordGlobalError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {t("profile.passwordSuccess")}
            </div>
          )}

          <Input
            label={t("fields.oldPassword")}
            type={showOldPassword ? "text" : "password"}
            autoComplete="current-password"
            value={passwordFields.oldPassword}
            onChange={(e) =>
              setPasswordFields((prev) => ({ ...prev, oldPassword: e.target.value }))
            }
            startIcon={<Lock size={16} />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="pointer-events-auto text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                aria-label={showOldPassword ? t("fields.hidePassword") : t("fields.showPassword")}
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={passwordErrors.oldPassword}
            disabled={passwordLoading}
            required
          />

          <Input
            label={t("fields.newPassword")}
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            value={passwordFields.newPassword}
            onChange={(e) =>
              setPasswordFields((prev) => ({ ...prev, newPassword: e.target.value }))
            }
            startIcon={<Lock size={16} />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="pointer-events-auto text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                aria-label={showNewPassword ? t("fields.hidePassword") : t("fields.showPassword")}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={passwordErrors.newPassword}
            disabled={passwordLoading}
            required
          />

          <Input
            label={t("fields.confirmPassword")}
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={passwordFields.confirmPassword}
            onChange={(e) =>
              setPasswordFields((prev) => ({ ...prev, confirmPassword: e.target.value }))
            }
            startIcon={<Lock size={16} />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="pointer-events-auto text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                aria-label={
                  showConfirmPassword ? t("fields.hidePassword") : t("fields.showPassword")
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            error={passwordErrors.confirmPassword}
            disabled={passwordLoading}
            required
          />

          <Button
            type="submit"
            loading={passwordLoading}
          >
            {t("profile.updatePassword")}
          </Button>
        </form>
      </section>

      {/* Delete Account Section (AqarChaab only) */}
      {showDeleteAccount && (
        <>
          <hr className="border-stone-200 dark:border-stone-700" />
          <section>
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
              {t("profile.dangerZone")}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              {t("profile.deleteWarning")}
            </p>

            {!showDeleteDialog ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={16} />
                {t("profile.deleteAccount")}
              </Button>
            ) : (
              <div className="rounded-md border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 space-y-4">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {t("profile.deleteConfirmMessage")}
                </p>
                <Input
                  label={t("profile.deleteConfirmLabel")}
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  disabled={deleteLoading}
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="danger"
                    loading={deleteLoading}
                    disabled={deleteConfirm !== "SUPPRIMER"}
                    onClick={handleDeleteAccount}
                  >
                    {t("profile.confirmDelete")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirm("");
                    }}
                    disabled={deleteLoading}
                  >
                    {tCommon("buttons.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
