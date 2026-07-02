import * as z from 'zod';

import { IssueStatusSchema, IssueUserSummarySchema } from './issues';

export const DashboardQuerySchema = z.object({
  recentLimit: z.coerce.number().int().min(1).max(12).default(4),
});

export const DashboardRecentIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  status: IssueStatusSchema.optional(),
  reporter: IssueUserSummarySchema.nullable().optional(),
  assignee: IssueUserSummarySchema.nullable().optional(),
  createdAt: z.string(),
});

export const DashboardSummarySchema = z.object({
  openIssuesCount: z.number(),
  unassignedOpenCount: z.number(),
  recentIssues: z.array(DashboardRecentIssueSchema),
});

export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
export type DashboardRecentIssue = z.infer<typeof DashboardRecentIssueSchema>;
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
