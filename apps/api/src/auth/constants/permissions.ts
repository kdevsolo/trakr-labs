import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';

export { PermissionAction, PermissionResource };

export const ORG_SCOPED_RESOURCES: PermissionResource[] = [
  PermissionResource.USER,
  PermissionResource.PROJECT,
];

export const PROJECT_SCOPED_RESOURCES: PermissionResource[] = [
  PermissionResource.ISSUE,
  PermissionResource.COMMENT,
  PermissionResource.ISSUE_MEDIA,
];

export function isProjectScopedResource(
  resource: PermissionResource,
): boolean {
  return PROJECT_SCOPED_RESOURCES.includes(resource);
}

export function toPermissionKey(
  resource: PermissionResource,
  action: PermissionAction,
): string {
  return `${resource.toLowerCase()}:${action.toLowerCase()}`;
}
