import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const secret =
    process.env.WIDGET_SECRET_ENCRYPTION_KEY ??
    process.env.GITHUB_STATE_SECRET;

  if (!secret) {
    throw new Error(
      'WIDGET_SECRET_ENCRYPTION_KEY or GITHUB_STATE_SECRET must be set',
    );
  }

  return scryptSync(secret, 'trakr-widget-secret-v1', 32);
}

export function encryptWidgetSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptWidgetSecret(payload: string): string {
  const [ivPart, authTagPart, dataPart] = payload.split('.');

  if (!ivPart || !authTagPart || !dataPart) {
    throw new Error('Invalid encrypted widget secret payload');
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivPart, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
