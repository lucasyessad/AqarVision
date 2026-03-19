"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { acceptInvitationAction } from "@/features/agencies/actions/invitation.action";

interface Props {
  token: string;
}

export function AcceptInvitationButton({ token }: Props) {
  const t = useTranslations("auth.invite");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitationAction(token);
      if (result.success) {
        router.push("/AqarPro/dashboard");
      }
    });
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleAccept}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? t("accepting") : t("accept")}
    </Button>
  );
}
