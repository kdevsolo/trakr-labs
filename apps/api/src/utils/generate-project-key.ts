import { createHash } from 'crypto';

export const generateProjectKey = (name: string, userId: string) => {
  const userIdHash = createHash('sha256').update(userId).digest('hex');
  return `${name.toLowerCase().replace(/ /g, '-')}-${userIdHash}`;
};
