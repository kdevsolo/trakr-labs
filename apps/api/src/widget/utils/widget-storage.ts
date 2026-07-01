import { getSupabaseAdmin } from 'src/auth/supabase-admin';
import { WIDGET_STORAGE_BUCKET } from '../constants/widget.constants';

const SIGNED_URL_TTL_SECONDS = 3600;

export function parseWidgetStoragePath(storedUrl: string): string | null {
  try {
    const parsed = new URL(storedUrl);
    const bucket = WIDGET_STORAGE_BUCKET;
    const prefixes = [
      `/storage/v1/object/public/${bucket}/`,
      `/storage/v1/object/authenticated/${bucket}/`,
      `/storage/v1/object/sign/${bucket}/`,
    ];

    for (const prefix of prefixes) {
      if (parsed.pathname.startsWith(prefix)) {
        return decodeURIComponent(parsed.pathname.slice(prefix.length));
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function createSignedWidgetMediaUrl(
  storedUrl: string,
  expiresIn = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const path = parseWidgetStoragePath(storedUrl);
  if (!path) {
    return storedUrl;
  }

  const { data, error } = await getSupabaseAdmin()
    .storage.from(WIDGET_STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return storedUrl;
  }

  return data.signedUrl;
}

export async function signIssueMedia<T extends { url: string }>(
  media: T[],
): Promise<T[]> {
  return Promise.all(
    media.map(async (item) => ({
      ...item,
      url: await createSignedWidgetMediaUrl(item.url),
    })),
  );
}

export async function withSignedIssueMedia<
  T extends { media: { url: string }[] },
>(issue: T): Promise<T> {
  return {
    ...issue,
    media: await signIssueMedia(issue.media),
  };
}

export async function withSignedIssueMediaList<
  T extends { media: { url: string }[] },
>(issues: T[]): Promise<T[]> {
  return Promise.all(issues.map((issue) => withSignedIssueMedia(issue)));
}
