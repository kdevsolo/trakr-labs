import * as z from 'zod';

export const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  statusId: z.string().min(1),
  assignedTo: z.string().optional(),
});

export const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  statusId: z.string().min(1).optional(),
  assignedTo: z.string().nullable().optional(),
});

export const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  projectId: z.string(),
  statusId: z.string(),
  reportedBy: z.string(),
  assignedTo: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;
export type Issue = z.infer<typeof IssueSchema>;
