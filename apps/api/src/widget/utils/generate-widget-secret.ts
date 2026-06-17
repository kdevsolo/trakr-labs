import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function generateWidgetSecret(): string {
  return `whsec_${randomBytes(32).toString('base64url')}`;
}

export function hashWidgetSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function verifyWidgetSecret(
  secret: string,
  hash: string | null | undefined,
): boolean {
  if (!hash) {
    return false;
  }

  const computed = hashWidgetSecret(secret);

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}
