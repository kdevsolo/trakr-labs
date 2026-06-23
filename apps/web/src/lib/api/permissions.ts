import type {
  MemberPermissions,
  PermissionGrant,
  SetPermissionsInput,
} from '@trakr/schemas'

import { apiFetch } from './client'

export function getMyPermissions() {
  return apiFetch<MemberPermissions>('/users/me/permissions')
}

export function getMemberPermissions(userId: string) {
  return apiFetch<MemberPermissions>(`/org/members/${userId}/permissions`)
}

export function setOrgPermissions(userId: string, grants: PermissionGrant[]) {
  return apiFetch<MemberPermissions>(
    `/org/members/${userId}/permissions`,
    {
      method: 'PUT',
      json: { grants } satisfies SetPermissionsInput,
    },
  )
}

export function setProjectPermissions(
  projectId: string,
  userId: string,
  grants: PermissionGrant[],
) {
  return apiFetch<MemberPermissions>(
    `/projects/${projectId}/members/${userId}/permissions`,
    {
      method: 'PUT',
      json: { grants } satisfies SetPermissionsInput,
    },
  )
}

export function removeProjectMember(projectId: string, userId: string) {
  return apiFetch<void>(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  })
}
