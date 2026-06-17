export const WIDGET_STORAGE_BUCKET =
  process.env.WIDGET_STORAGE_BUCKET ?? 'widget-feedback';

export const WIDGET_MAX_FILE_SIZE_BYTES = Number(
  process.env.WIDGET_MAX_FILE_SIZE_BYTES ?? 5 * 1024 * 1024,
);

export const WIDGET_MAX_MEDIA_COUNT = Number(
  process.env.WIDGET_MAX_MEDIA_COUNT ?? 5,
);

export const ALLOWED_WIDGET_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const WIDGET_PROJECT_KEY_HEADER = 'x-project-key';
export const WIDGET_SECRET_HEADER = 'x-widget-secret';
