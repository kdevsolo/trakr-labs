import * as z from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(255)
    .refine((name) => !name.includes(' '), {
      message: 'Organization name must not contain spaces',
    }),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdBy: z.string(),
  modifiedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StatusMasterSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  title: z.string(),
  sortOrder: z.number(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type StatusMaster = z.infer<typeof StatusMasterSchema>;
