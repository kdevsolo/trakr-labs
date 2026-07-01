const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function safeExternalHref(url: string): string | undefined {
  return isSafeExternalUrl(url) ? url : undefined;
}
