import * as z from 'zod';

import { PaginationQuerySchema } from './pagination';
import { FeedbackContextSchema } from './widget';

const uuidSchema = z.string().uuid();

export const ListIssuesQuerySchema = PaginationQuerySchema.extend({
  statusId: uuidSchema.optional(),
  assignedTo: z
    .string()
    .refine(
      (value) => value === 'unassigned' || uuidSchema.safeParse(value).success,
      { message: 'assignedTo must be a UUID or "unassigned"' },
    )
    .optional(),
});

export const IssueUserSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const IssueStatusSchema = z.object({
  id: z.string(),
  title: z.string(),
  sortOrder: z.number(),
  active: z.boolean(),
});

export const IssueMediaSchema = z.object({
  id: z.string(),
  issueId: z.string(),
  url: z.string(),
  fileType: z.string().nullable(),
  createdAt: z.string(),
});

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
  reportedBy: z.string().nullable(),
  assignedTo: z.string().nullable(),
  assignedBy: z.string().nullable().optional(),
  modifiedBy: z.string().nullable().optional(),
  metadata: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const IssueWithRelationsSchema = IssueSchema.extend({
  status: IssueStatusSchema.optional(),
  reporter: IssueUserSummarySchema.nullable().optional(),
  assignee: IssueUserSummarySchema.nullable().optional(),
  media: z.array(IssueMediaSchema).optional(),
});

export const WidgetIssueMetadataSchema = z.object({
  source: z.literal('widget'),
  email: z.string().email(),
  pageUrl: z.string().nullable().optional(),
  submittedAt: z.string(),
  context: FeedbackContextSchema.optional(),
  server: z
    .object({
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type ListIssuesQuery = z.infer<typeof ListIssuesQuerySchema>;
export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type IssueUserSummary = z.infer<typeof IssueUserSummarySchema>;
export type IssueStatus = z.infer<typeof IssueStatusSchema>;
export type IssueMedia = z.infer<typeof IssueMediaSchema>;
export type IssueWithRelations = z.infer<typeof IssueWithRelationsSchema>;
export type WidgetIssueMetadata = z.infer<typeof WidgetIssueMetadataSchema>;
