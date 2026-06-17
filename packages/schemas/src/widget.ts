import * as z from 'zod';

export const FeedbackMediaSchema = z.object({
  url: z.url(),
  fileType: z.string().optional(),
});

export const SubmitFeedbackSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  email: z.string().email().optional(),
  pageUrl: z.string().url().optional(),
  media: z.array(FeedbackMediaSchema).max(5).optional(),
});

export const SubmitFeedbackResponseSchema = z.object({
  id: z.string(),
});

export const RequestUploadUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
});

export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
  path: z.string(),
});

export const WidgetConfigSchema = z.object({
  projectKey: z.string(),
  enabled: z.boolean(),
  hasSecret: z.boolean(),
});

export const EnableWidgetResponseSchema = z.object({
  projectKey: z.string(),
  widgetSecret: z.string(),
  enabled: z.boolean(),
});

export type FeedbackMedia = z.infer<typeof FeedbackMediaSchema>;
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
export type SubmitFeedbackResponse = z.infer<typeof SubmitFeedbackResponseSchema>;
export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type EnableWidgetResponse = z.infer<typeof EnableWidgetResponseSchema>;
