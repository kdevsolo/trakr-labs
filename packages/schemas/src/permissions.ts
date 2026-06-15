import * as z from 'zod';

export const PermissionResourceSchema = z.enum([
  'PROJECT',
  'USER',
  'ISSUE',
  'COMMENT',
  'ISSUE_MEDIA',
]);

export const PermissionActionSchema = z.enum([
  'READ',
  'CREATE',
  'UPDATE',
  'DELETE',
]);

export const PermissionGrantSchema = z.object({
  resource: PermissionResourceSchema,
  action: PermissionActionSchema,
});

export const SetPermissionsSchema = z.object({
  grants: z.array(PermissionGrantSchema),
});

export const AddProjectMemberByUserIdSchema = z.object({
  userId: z.string().min(1),
});

export type PermissionGrant = z.infer<typeof PermissionGrantSchema>;
export type SetPermissionsInput = z.infer<typeof SetPermissionsSchema>;
export type AddProjectMemberByUserIdInput = z.infer<
  typeof AddProjectMemberByUserIdSchema
>;
