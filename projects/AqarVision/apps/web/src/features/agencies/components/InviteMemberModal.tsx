"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Mail, UserPlus } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createInvitationAction } from "@/features/agencies/actions/invitation.action";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  agencyId: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

export function InviteMemberModal({
  open,
  onClose,
  agencyId,
}: InviteMemberModalProps) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleClose() {
    setEmail("");
    setRole("agent");
    setError(null);
    setSuccess(false);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("errors.emailInvalid"));
      return;
    }

    startTransition(async () => {
      const result = await createInvitationAction(
        agencyId,
        email,
        role as "admin" | "agent" | "editor" | "viewer"
      );

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={t("inviteTitle")}
      description={t("inviteDescription")}
    >
      {success ? (
        <div className="text-center py-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mb-3">
            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1">
            {t("inviteSent")}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {t("inviteSentDescription", { email })}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={handleClose}
          >
            {tCommon("close")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Input
            label={t("emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="membre@agence.dz"
            startIcon={<Mail size={16} />}
          />

          <Select
            label={t("roleLabel")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
          />

          <p className="text-xs text-stone-500 dark:text-stone-400">
            {t("inviteNote")}
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isPending}
            >
              <UserPlus size={16} />
              {t("sendInvite")}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
