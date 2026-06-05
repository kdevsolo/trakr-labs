import { SetMetadata } from '@nestjs/common';
import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';
import { REQUIRE_PERMISSION_KEY } from '../constants/metadata';

export interface RequiredPermission {
  resource: PermissionResource;
  action: PermissionAction;
}

export const RequirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { resource, action } satisfies RequiredPermission);
