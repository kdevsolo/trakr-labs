import type { InviteUserInput, PermissionGrant } from '@trakr/schemas'

/** Org-scoped roles mapped to backend ORG_ALLOWED_GRANTS. */
export type OrgRole = 'admin' | 'project_creator' | 'member'

export const ORG_ROLE_GRANTS: Record<OrgRole, InviteUserInput['permissions']> = {
  admin: [
    { resource: 'USER', action: 'READ' },
    { resource: 'USER', action: 'CREATE' },
    { resource: 'USER', action: 'UPDATE' },
    { resource: 'USER', action: 'DELETE' },
    { resource: 'PROJECT', action: 'CREATE' },
  ],
  project_creator: [{ resource: 'PROJECT', action: 'CREATE' }],
  member: [],
}

export const ORG_ROLE_OPTIONS: {
  value: OrgRole
  label: string
  hint: string
}[] = [
  { value: 'admin', label: 'Admin', hint: 'Manage members & create projects' },
  {
    value: 'project_creator',
    label: 'Project creator',
    hint: 'Can create projects',
  },
  { value: 'member', label: 'Member', hint: 'Project access granted later' },
]

export function deriveOrgPermissions(role: OrgRole): PermissionGrant[] {
  return ORG_ROLE_GRANTS[role]
}

function grantsMatch(
  grants: PermissionGrant[],
  expected: PermissionGrant[],
): boolean {
  if (grants.length !== expected.length) return false
  const keys = (list: PermissionGrant[]) =>
    list.map((g) => `${g.resource}:${g.action}`).sort()
  const a = keys(grants)
  const b = keys(expected)
  return a.every((k, i) => k === b[i])
}

export function inferOrgRole(grants: PermissionGrant[]): OrgRole {
  if (grantsMatch(grants, ORG_ROLE_GRANTS.admin)) return 'admin'
  if (grantsMatch(grants, ORG_ROLE_GRANTS.project_creator))
    return 'project_creator'
  return 'member'
}

export function orgRoleLabel(
  isOrgAdmin: boolean,
  orgWideGrants: PermissionGrant[],
): string {
  if (isOrgAdmin) return 'Org Admin'
  const role = inferOrgRole(orgWideGrants)
  if (role === 'admin') return 'Admin'
  if (role === 'project_creator') return 'Project creator'
  return 'Member'
}
