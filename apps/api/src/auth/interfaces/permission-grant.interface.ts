import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';

export interface PermissionGrant {
  resource: PermissionResource;
  action: PermissionAction;
  projectId?: string | null;
}
