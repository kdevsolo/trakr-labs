import * as z from 'zod';

import { IssueUserSummarySchema } from './issues';

export const CreateCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const CommentSchema = z.object({
  id: z.string(),
  issueId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: IssueUserSummarySchema.optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type Comment = z.infer<typeof CommentSchema>;
