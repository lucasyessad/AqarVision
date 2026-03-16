import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

export const AGENCY_ROLES = ["admin", "agent", "editor", "viewer"] as const;
export type AgencyRole = (typeof AGENCY_ROLES)[number];

export const ALL_AGENCY_ROLES = ["owner", ...AGENCY_ROLES] as const;
export type AnyAgencyRole = (typeof ALL_AGENCY_ROLES)[number];

export const CreateAgencySchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeInput),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(500).transform(sanitizeInput).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type CreateAgencyInput = z.infer<typeof CreateAgencySchema>;

export const UpdateAgencySchema = z.object({
  agency_id: z.string().uuid(),
  name: z.string().min(2).max(100).transform(sanitizeInput).optional(),
  description: z.string().max(500).transform(sanitizeInput).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type UpdateAgencyInput = z.infer<typeof UpdateAgencySchema>;

export const CreateBranchSchema = z.object({
  agency_id: z.string().uuid(),
  name: z.string().min(2).max(100).transform(sanitizeInput),
  wilaya_code: z.string().min(1).max(10),
  commune_id: z.number().optional(),
  address_text: z.string().max(500).transform(sanitizeInput).optional(),
});

export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;

export const InviteMemberSchema = z.object({
  agency_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(AGENCY_ROLES),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

export const ChangeMemberRoleSchema = z.object({
  agency_id: z.string().uuid(),
  user_id: z.string().uuid(),
  new_role: z.enum(AGENCY_ROLES),
});

export type ChangeMemberRoleInput = z.infer<typeof ChangeMemberRoleSchema>;
