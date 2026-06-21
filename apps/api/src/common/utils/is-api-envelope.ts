import { isApiSuccessResponse } from '@trakr/schemas';

export function isAlreadyWrapped(value: unknown): boolean {
  return isApiSuccessResponse(value);
}
