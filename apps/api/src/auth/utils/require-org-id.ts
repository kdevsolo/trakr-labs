import { ForbiddenException } from '@nestjs/common';

export function requireOrgId(orgId: string | null): string {
  if (!orgId) {
    throw new ForbiddenException('Organization membership required');
  }
  return orgId;
}
