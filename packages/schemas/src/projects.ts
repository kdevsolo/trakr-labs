import * as z from 'zod';

export enum PermissionAction {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
});

export const ProjectMemberActionSchema = z.enum([
  PermissionAction.READ,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
]);

export const AddProjectMemberSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
  actions: z.array(ProjectMemberActionSchema).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  orgId: z.string(),
  projectKey: z.string(),
  createdBy: z.string(),
  modifiedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof AddProjectMemberSchema>;