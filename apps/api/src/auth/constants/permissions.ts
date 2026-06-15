import {
  PermissionAction,
  PermissionResource,
} from '../../generated/prisma/client';

export { PermissionAction, PermissionResource };

export type PermissionScope = 'org' | 'project';

const ALL_ACTIONS: readonly PermissionAction[] = [
  PermissionAction.READ,
  PermissionAction.CREATE,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
];

/**
 * Grants an org admin can assign at the organization level (projectId = null).
 * - USER: full CRUD (managing org members).
 * - PROJECT: CREATE only (ability to create new projects).
 */
export const ORG_ALLOWED_GRANTS: ReadonlyArray<{
  resource: PermissionResource;
  actions: readonly PermissionAction[];
}> = [
  { resource: PermissionResource.USER, actions: ALL_ACTIONS },
  { resource: PermissionResource.PROJECT, actions: [PermissionAction.CREATE] },
];

/**
 * Grants an org admin can assign at the project level (projectId set).
 * - PROJECT: READ/UPDATE/DELETE on a specific project. This grant also governs
 *   the project's issues and comments (READ to read, UPDATE to create/update/delete).
 */
export const PROJECT_ALLOWED_GRANTS: ReadonlyArray<{
  resource: PermissionResource;
  actions: readonly PermissionAction[];
}> = [
  {
    resource: PermissionResource.PROJECT,
    actions: [
      PermissionAction.READ,
      PermissionAction.UPDATE,
      PermissionAction.DELETE,
    ],
  },
];

export function isGrantAllowed(
  scope: PermissionScope,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  const allowed =
    scope === 'org' ? ORG_ALLOWED_GRANTS : PROJECT_ALLOWED_GRANTS;
  return allowed.some(
    (entry) => entry.resource === resource && entry.actions.includes(action),
  );
}

export function toPermissionKey(
  resource: PermissionResource,
  action: PermissionAction,
): string {
  return `${resource.toLowerCase()}:${action.toLowerCase()}`;
}
