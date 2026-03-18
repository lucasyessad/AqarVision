"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail, type ActionResult } from "@/lib/action-result";
import { inviteMemberSchema } from "@/features/agencies/schemas/agency.schema";
import { withAgencyAuth } from "@/lib/auth/with-agency-auth";
import { sendEmail } from "@/lib/email/send";
import { createLogger } from "@/lib/logger";
import { createElement } from "react";

const log = createLogger("invitation.action");

export async function createInvitationAction(
  agencyId: string,
  email: string,
  role: "admin" | "agent" | "editor" | "viewer"
): Promise<ActionResult<{ id: string }>> {
  return withAgencyAuth(agencyId, "invitation", "create", async (ctx) => {
    const parsed = inviteMemberSchema.safeParse({ email, role });
    if (!parsed.success) {
      throw new Error(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const supabase = await createClient();

    // Check if already a member
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .maybeSingle();

    if (existingUser) {
      const { data: existingMembership } = await supabase
        .from("agency_memberships")
        .select("id")
        .eq("agency_id", agencyId)
        .eq("user_id", existingUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existingMembership) {
        throw new Error("Cet utilisateur est déjà membre de cette agence");
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("email", parsed.data.email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      throw new Error("Une invitation est déjà en attente pour cet email");
    }

    // Generate token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation record
    const { data: invitation, error } = await supabase
      .from("invitations")
      .insert({
        agency_id: agencyId,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        invited_by: ctx.userId,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // Get agency name for email
    const { data: agency } = await supabase
      .from("agencies")
      .select("name")
      .eq("id", agencyId)
      .single();

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aqarvision.com";
    const inviteUrl = `${baseUrl}/fr/invite/${token}`;

    try {
      await sendEmail({
        to: parsed.data.email,
        subject: `Invitation à rejoindre ${agency?.name ?? "une agence"} sur AqarVision`,
        react: createElement("div", null,
          createElement("h2", null, "Vous avez été invité"),
          createElement("p", null,
            `Vous avez été invité à rejoindre ${agency?.name ?? "une agence"} en tant que ${parsed.data.role}.`
          ),
          createElement("p", null,
            createElement("a", { href: inviteUrl }, "Accepter l'invitation")
          ),
          createElement("p", null, "Ce lien expire dans 7 jours.")
        ),
      });
    } catch (emailError) {
      log.error({ emailError, email: parsed.data.email }, "Failed to send invitation email");
      // Don't fail the action — invitation is created, email sending is best-effort
    }

    log.info(
      { agencyId, invitedEmail: parsed.data.email, role: parsed.data.role },
      "Invitation created"
    );

    revalidatePath("/AqarPro/dashboard/team");

    return { id: invitation.id };
  });
}

export async function acceptInvitationAction(
  token: string
): Promise<ActionResult<{ agencyId: string }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return fail("UNAUTHORIZED", "Vous devez être connecté pour accepter une invitation");
    }

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return fail("NOT_FOUND", "Invitation introuvable ou déjà utilisée");
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return fail("EXPIRED", "Cette invitation a expiré");
    }

    // Check if already a member
    const { data: existingMembership } = await supabase
      .from("agency_memberships")
      .select("id")
      .eq("agency_id", invitation.agency_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (existingMembership) {
      return fail("ALREADY_MEMBER", "Vous êtes déjà membre de cette agence");
    }

    // Create membership
    const { error: membershipError } = await supabase
      .from("agency_memberships")
      .insert({
        agency_id: invitation.agency_id,
        user_id: user.id,
        role: invitation.role,
        is_active: true,
      });

    if (membershipError) throw membershipError;

    // Mark invitation as accepted
    await supabase
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    log.info(
      {
        agencyId: invitation.agency_id,
        userId: user.id,
        role: invitation.role,
      },
      "Invitation accepted"
    );

    revalidatePath("/AqarPro/dashboard/team");

    return ok({ agencyId: invitation.agency_id });
  } catch (error) {
    log.error({ error, token }, "Failed to accept invitation");
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'acceptation";
    return fail("INTERNAL_ERROR", message);
  }
}
