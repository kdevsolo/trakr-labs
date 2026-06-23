'use client'

import { Loader2 } from 'lucide-react'

import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import type { MemberPermissions, PaginationMeta, User } from '@/lib/api/types'
import { orgRoleLabel } from '@/lib/permissions/org-role'

import { OrgAccessBadge } from './OrgAccessBadge'

type MembersTableProps = {
  members: User[]
  meta: PaginationMeta
  permissionsByUserId: Record<string, MemberPermissions | undefined>
  permissionsLoading: boolean
  canManage: boolean
  onManage: (member: User) => void
  onAddMember?: () => void
  onPageChange: (page: number) => void
}

export function MembersTable({
  members,
  meta,
  permissionsByUserId,
  permissionsLoading,
  canManage,
  onManage,
  onAddMember,
  onPageChange,
}: MembersTableProps) {
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize))
  const rangeStart =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1
  const rangeEnd = Math.min(meta.page * meta.pageSize, meta.total)

  if (permissionsLoading && members.length > 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-white py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (meta.total === 0) {
    return (
      <div className="rounded-lg border border-border bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No team members yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite colleagues to collaborate on issues and projects.
        </p>
        {canManage && onAddMember && (
          <Button size="sm" className="mt-4" onClick={onAddMember}>
            Add Member
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Member
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Org access
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Projects
              </th>
              {canManage && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const permissions = permissionsByUserId[member.id]
              const projectCount = permissions
                ? Object.keys(permissions.byProject).length
                : 0
              const orgLabel = orgRoleLabel(
                member.isOrgAdmin,
                permissions?.orgWide ?? [],
              )

              return (
                <tr
                  key={member.id}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    {member.name}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <OrgAccessBadge label={orgLabel} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {projectCount === 0
                      ? 'None'
                      : `${projectCount} project${projectCount === 1 ? '' : 's'}`}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3.5 text-right">
                      {orgLabel !== 'Org Admin' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManage(member)}
                        >
                          Manage
                        </Button>
                      ) : null}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={meta.page}
        totalPages={totalPages}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={meta.total}
        onPageChange={onPageChange}
        itemLabel="member"
      />
    </div>
  )
}
