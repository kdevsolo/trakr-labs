'use client'

import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'

import { getMemberPermissions, queryKeys } from '@/lib/api'
import type { MemberPermissions, User } from '@/lib/api/types'
import { useMe } from '@/hooks/api/use-me'
import { useOrgMembersList } from '@/hooks/api/use-org-members-list'
import { useIsClient } from '@/hooks/use-is-client'

import { AddMemberDrawer } from './AddMemberDrawer'
import { MemberPermissionsDrawer } from './MemberPermissionsDrawer'
import { MembersTable } from './MembersTable'
import { TeamHeader } from './TeamHeader'

const PAGE_SIZE = 8

const DEFAULT_META = {
  page: 1,
  pageSize: PAGE_SIZE,
  total: 0,
}

export function TeamView() {
  const isClient = useIsClient()
  const { data: me } = useMe()
  const [page, setPage] = useState(1)
  const { data: membersResult, isLoading: membersLoading } = useOrgMembersList({
    page,
    pageSize: PAGE_SIZE,
  })
  const members = membersResult?.items ?? []
  const meta = membersResult?.meta ?? DEFAULT_META
  const canManage = me?.isOrgAdmin ?? false

  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [permissionsDrawerOpen, setPermissionsDrawerOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)

  const permissionQueries = useQueries({
    queries: members.map((member) => ({
      queryKey: queryKeys.permissions.member(member.id),
      queryFn: () => getMemberPermissions(member.id),
      enabled: isClient && canManage && members.length > 0,
    })),
  })

  const permissionsByUserId = useMemo(() => {
    const map: Record<string, MemberPermissions> = {}
    members.forEach((member, index) => {
      const data = permissionQueries[index]?.data
      if (data) map[member.id] = data
    })
    return map
  }, [members, permissionQueries])

  const permissionsLoading =
    canManage &&
    members.length > 0 &&
    permissionQueries.some((q) => q.isLoading)

  function handleManage(member: User) {
    setSelectedMember(member)
    setPermissionsDrawerOpen(true)
  }

  if (membersLoading) {
    return (
      <div className="flex flex-col gap-4">
        <TeamHeader
          memberCount={0}
          canManage={canManage}
          onAddMember={() => setAddDrawerOpen(true)}
        />
        <div className="flex items-center justify-center rounded-lg border border-border bg-white py-16">
          <p className="text-sm text-muted-foreground">Loading members…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <TeamHeader
        memberCount={meta.total}
        canManage={canManage}
        onAddMember={() => setAddDrawerOpen(true)}
      />

      <MembersTable
        members={members}
        meta={meta}
        permissionsByUserId={permissionsByUserId}
        permissionsLoading={permissionsLoading}
        canManage={canManage}
        onManage={handleManage}
        onAddMember={() => setAddDrawerOpen(true)}
        onPageChange={setPage}
      />

      <AddMemberDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
      />

      <MemberPermissionsDrawer
        member={selectedMember}
        open={permissionsDrawerOpen}
        onClose={() => {
          setPermissionsDrawerOpen(false)
          setSelectedMember(null)
        }}
      />
    </div>
  )
}
