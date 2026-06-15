import type { PermissionGrant } from '@trakr/schemas'

/** Project-scoped access levels mapped to PROJECT_ALLOWED_GRANTS. */
export type ProjectAccessLevel = 'none' | 'read_only' | 'read_write' | 'full'

export const PROJECT_ACCESS_GRANTS: Record<
  Exclude<ProjectAccessLevel, 'none'>,
  PermissionGrant[]
> = {
  read_only: [{ resource: 'PROJECT', action: 'READ' }],
  read_write: [
    { resource: 'PROJECT', action: 'READ' },
    { resource: 'PROJECT', action: 'UPDATE' },
  ],
  full: [
    { resource: 'PROJECT', action: 'READ' },
    { resource: 'PROJECT', action: 'UPDATE' },
    { resource: 'PROJECT', action: 'DELETE' },
  ],
}

export const PROJECT_ACCESS_OPTIONS: {
  value: ProjectAccessLevel
  label: string
}[] = [
  { value: 'none', label: 'None' },
  { value: 'read_only', label: 'Read only' },
  { value: 'read_write', label: 'Read & write' },
  { value: 'full', label: 'Full access' },
]

export function deriveProjectGrants(
  level: ProjectAccessLevel,
): PermissionGrant[] {
  if (level === 'none') return []
  return PROJECT_ACCESS_GRANTS[level]
}

export function inferProjectAccessLevel(
  grants: PermissionGrant[],
): ProjectAccessLevel {
  if (grants.length === 0) return 'none'
  if (
    grants.some((g) => g.resource === 'PROJECT' && g.action === 'DELETE')
  ) {
    return 'full'
  }
  if (
    grants.some((g) => g.resource === 'PROJECT' && g.action === 'UPDATE')
  ) {
    return 'read_write'
  }
  if (
    grants.some((g) => g.resource === 'PROJECT' && g.action === 'READ')
  ) {
    return 'read_only'
  }
  return 'none'
}
