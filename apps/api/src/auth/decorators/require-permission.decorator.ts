import { SetMetadata } from '@nestjs/common';
import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';
import { PermissionScope } from '../constants/permissions';
import { REQUIRE_PERMISSION_KEY } from '../constants/metadata';

export interface RequiredPermission {
  resource: PermissionResource;
  action: PermissionAction;
  scope: PermissionScope;
}

export const RequirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
  scope: PermissionScope = 'org',
) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, {
    resource,
    action,
    scope,
  } satisfies RequiredPermission);
