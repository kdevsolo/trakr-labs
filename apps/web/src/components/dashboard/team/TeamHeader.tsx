'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type TeamHeaderProps = {
  memberCount: number
  canManage: boolean
  onAddMember: () => void
}

export function TeamHeader({
  memberCount,
  canManage,
  onAddMember,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Team
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage team members and their permissions.
          </p>
          {memberCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {memberCount} member{memberCount === 1 ? '' : 's'} in your
              organization
            </p>
          )}
        </div>

        {canManage && (
          <Button size="sm" className="gap-1.5" onClick={onAddMember}>
            <Plus className="size-4" />
            Add Member
          </Button>
        )}
      </div>
    </div>
  )
}
