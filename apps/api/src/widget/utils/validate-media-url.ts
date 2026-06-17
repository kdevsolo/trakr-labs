import { WIDGET_STORAGE_BUCKET } from '../constants/widget.constants';

export function buildPublicStorageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
): string {
  const base = supabaseUrl.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function isValidWidgetMediaUrl(
  url: string,
  projectId: string,
  supabaseUrl: string,
  bucket: string = WIDGET_STORAGE_BUCKET,
): boolean {
  try {
    const parsed = new URL(url);
    const expectedHost = new URL(supabaseUrl).host;

    if (parsed.host !== expectedHost) {
      return false;
    }

    const prefix = `/storage/v1/object/public/${bucket}/${projectId}/`;
    return parsed.pathname.startsWith(prefix);
  } catch {
    return false;
  }
}
