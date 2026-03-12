import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'agent', 'viewer'], { message: 'Rôle invalide' }),
  fullName: z.string().min(2, 'Nom requis (2 caractères minimum)').max(100),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid('ID membre invalide'),
  role: z.enum(['admin', 'agent', 'viewer'], { message: 'Rôle invalide' }),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
