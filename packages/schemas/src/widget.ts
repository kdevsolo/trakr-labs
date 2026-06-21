import * as z from 'zod';

export const FeedbackMediaSchema = z.object({
  url: z.url(),
  fileType: z.string().optional(),
});

export const ConsoleLogEntrySchema = z.object({
  level: z.enum(['log', 'warn', 'error', 'info', 'debug']),
  message: z.string().max(2000),
  timestamp: z.string(),
});

export const FailedNetworkRequestSchema = z.object({
  url: z.string().max(2000),
  method: z.string().max(10).optional(),
  status: z.number().int().optional(),
  statusText: z.string().max(200).optional(),
  durationMs: z.number().optional(),
  error: z.string().max(500).optional(),
  timestamp: z.string(),
});

export const DeviceContextSchema = z.object({
  userAgent: z.string().max(1000),
  language: z.string().max(50),
  languages: z.array(z.string()).max(20).optional(),
  platform: z.string().max(100).optional(),
  screen: z.object({
    width: z.number(),
    height: z.number(),
  }),
  viewport: z.object({
    width: z.number(),
    height: z.number(),
  }),
  devicePixelRatio: z.number().optional(),
  timezone: z.string().max(100).optional(),
  online: z.boolean().optional(),
  referrer: z.string().max(2000).optional(),
});

export const FeedbackContextSchema = z.object({
  device: DeviceContextSchema,
  consoleLogs: z.array(ConsoleLogEntrySchema).max(100).optional(),
  failedRequests: z.array(FailedNetworkRequestSchema).max(30).optional(),
});

export const SubmitFeedbackSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  email: z.string().email(),
  pageUrl: z.string().url().optional(),
  media: z.array(FeedbackMediaSchema).max(5).optional(),
  context: FeedbackContextSchema.optional(),
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
export type ConsoleLogEntry = z.infer<typeof ConsoleLogEntrySchema>;
export type FailedNetworkRequest = z.infer<typeof FailedNetworkRequestSchema>;
export type DeviceContext = z.infer<typeof DeviceContextSchema>;
export type FeedbackContext = z.infer<typeof FeedbackContextSchema>;
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;
export type SubmitFeedbackResponse = z.infer<typeof SubmitFeedbackResponseSchema>;
export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type EnableWidgetResponse = z.infer<typeof EnableWidgetResponseSchema>;
