import * as z from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  orgId: z.string().min(1).optional(),
  isOrgAdmin: z.boolean().optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial();
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  orgId: z.string().optional(),
  isOrgAdmin: z.boolean().optional(),
});

const PermissionResourceEnum = z.enum([
  'PROJECT',
  'USER',
  'ISSUE',
  'COMMENT',
  'ISSUE_MEDIA',
]);

const PermissionActionEnum = z.enum(['READ', 'CREATE', 'UPDATE', 'DELETE']);

export const InviteUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  permissions: z
    .array(
      z.object({
        resource: PermissionResourceEnum,
        action: PermissionActionEnum,
        projectId: z.string().uuid().optional(),
      }),
    )
    .min(1),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;