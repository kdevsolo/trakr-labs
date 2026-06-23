import * as z from 'zod';
import {
  PermissionActionSchema,
  PermissionResourceSchema,
} from './permissions';

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  orgId: z.string().min(1).optional(),
  isOrgAdmin: z.boolean().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
});
export const AcceptTermsSchema = z.object({
  tncAccepted: z.literal(true),
});
export const UpdateMemberSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isOrgAdmin: z.boolean().optional(),
});
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  orgId: z.string().nullable(),
  isOrgAdmin: z.boolean(),
  tncAccepted: z.boolean(),
  tncAcceptingTimestamp: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InviteUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  permissions: z.array(
    z.object({
      resource: PermissionResourceSchema,
      action: PermissionActionSchema,
      projectId: z.string().uuid().optional(),
    }),
  ),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type AcceptTermsInput = z.infer<typeof AcceptTermsSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type User = z.infer<typeof UserSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;